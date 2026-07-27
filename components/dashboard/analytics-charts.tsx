"use client"

import * as React from "react"
import { ExpandIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  CHART_ANIMATION_MS,
  CHART_CURSOR,
  CHART_STAGGER_MS,
  ChartActiveDot,
  ChartSeriesGradient,
  DeltaTooltipBody,
  formatSignedDelta,
  type ValueFormat,
} from "@/components/dashboard/chart-style"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  cn,
  formatChartDate,
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentRate,
} from "@/lib/utils"
import type { KpiKey, MetricPointRow } from "@/types/metrics"

type ChartDef = {
  key: KpiKey
  title: string
  description: string
  format: ValueFormat
  pick: (row: MetricPointRow) => number
}

const CHARTS: ChartDef[] = [
  {
    key: "mrr",
    title: "MRR",
    description: "Monthly recurring revenue.",
    format: "currency",
    pick: (row) => row.mrr,
  },
  {
    key: "active_users",
    title: "Active Users",
    description: "Active users over the period.",
    format: "number",
    pick: (row) => row.active_users,
  },
  {
    key: "churn_rate",
    title: "Churn Rate",
    description: "Customer churn rate.",
    format: "percent",
    pick: (row) => row.churn_rate,
  },
  {
    key: "arpu",
    title: "ARPU",
    description: "Average revenue per user.",
    format: "currency",
    pick: (row) => row.arpu,
  },
]

const chartConfig = {
  mrr: { label: "MRR", color: "var(--chart-1)" },
  active_users: { label: "Active Users", color: "var(--chart-2)" },
  churn_rate: { label: "Churn Rate", color: "var(--chart-3)" },
  arpu: { label: "ARPU", color: "var(--chart-4)" },
} satisfies ChartConfig

const ANALYTICS_SYNC_ID = "pulse-analytics"

function formatValue(format: ValueFormat, value: number): string {
  switch (format) {
    case "currency":
      return formatCompactCurrency(value)
    case "percent":
      return formatPercentRate(value)
    case "number":
      return formatCompactNumber(value)
  }
}

function valueDomain(
  values: number[],
  format: ValueFormat
): [number, number] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (format === "percent") {
    const pad = Math.max((max - min) * 0.2, 0.002)
    return [Math.max(0, min - pad), max + pad]
  }
  const pad = Math.max(
    (max - min) * 0.15,
    max * 0.02,
    format === "number" ? 5 : 50
  )
  return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]
}

type ChartPoint = {
  date: string
  label: string
  value: number
  prevValue: number | null
  seriesKey: KpiKey
}

function MetricTooltipContent({
  active,
  payload,
  format,
  title,
}: {
  active?: boolean
  payload?: Array<{ payload?: ChartPoint; value?: number | string }>
  format: ValueFormat
  title: string
}) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  if (!row) return null

  const value = Number(payload[0]?.value ?? row.value)
  const deltaLabel =
    row.prevValue === null
      ? null
      : formatSignedDelta(value, row.prevValue, format, {
          currency: formatCompactCurrency,
          number: formatCompactNumber,
          percent: formatPercentRate,
        })

  const deltaPositive =
    row.prevValue === null
      ? null
      : value - row.prevValue === 0
        ? null
        : format === "percent"
          ? value < row.prevValue
          : value > row.prevValue

  return (
    <div className="rounded-xl bg-popover/95 px-2.5 py-2 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 backdrop-blur-sm dark:ring-foreground/10">
      <DeltaTooltipBody
        label={formatChartDate(row.date)}
        valueLabel={title}
        valueNode={formatValue(format, value)}
        deltaLabel={deltaLabel}
        deltaPositive={deltaPositive}
      />
    </div>
  )
}

type AnalyticsChartsProps = {
  data: MetricPointRow[]
}

type DayDetailSelection = {
  date: string
  focusKey: KpiKey
}

function deltaTone(
  format: ValueFormat,
  value: number,
  prevValue: number | null
): boolean | null {
  if (prevValue === null) return null
  if (value - prevValue === 0) return null
  return format === "percent" ? value < prevValue : value > prevValue
}

function AnalyticsDayDetailSheet({
  data,
  selection,
  onOpenChange,
}: {
  data: MetricPointRow[]
  selection: DayDetailSelection | null
  onOpenChange: (open: boolean) => void
}) {
  const index = selection
    ? data.findIndex((row) => row.date === selection.date)
    : -1
  const point = index >= 0 ? data[index] : null
  const previous = index > 0 ? data[index - 1] : null

  return (
    <Sheet open={selection !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-mono">
            {selection ? formatChartDate(selection.date) : "Day detail"}
          </SheetTitle>
          <SheetDescription>
            Point detail with day-over-day delta. Crosshair stays synced across
            the Analytics grid.
          </SheetDescription>
        </SheetHeader>

        {point && selection ? (
          <div className="flex flex-col gap-4 px-4 pb-6">
            {CHARTS.map((def) => {
              const value = def.pick(point)
              const prevValue = previous ? def.pick(previous) : null
              const deltaLabel =
                prevValue === null
                  ? null
                  : formatSignedDelta(value, prevValue, def.format, {
                      currency: formatCompactCurrency,
                      number: formatCompactNumber,
                      percent: formatPercentRate,
                    })
              const positive = deltaTone(def.format, value, prevValue)
              const focused = def.key === selection.focusKey

              return (
                <div
                  key={def.key}
                  className={cn(
                    "rounded-2xl border border-border/60 px-3 py-3",
                    focused && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {def.title}
                    </span>
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {formatValue(def.format, value)}
                    </span>
                  </div>
                  {deltaLabel ? (
                    <p
                      className={
                        positive === null
                          ? "mt-1 font-mono text-[11px] tabular-nums text-muted-foreground"
                          : positive
                            ? "mt-1 font-mono text-[11px] tabular-nums text-success"
                            : "mt-1 font-mono text-[11px] tabular-nums text-destructive"
                      }
                    >
                      {deltaLabel}
                      <span className="ml-1 text-muted-foreground">
                        vs prior day
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      No prior day in range
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function AnalyticsMetricChart({
  def,
  data,
  mounted,
  index,
  expanded,
  onExpand,
  onPointSelect,
}: {
  def: ChartDef
  data: MetricPointRow[]
  mounted: boolean
  index: number
  expanded?: boolean
  onExpand?: () => void
  onPointSelect?: (selection: DayDetailSelection) => void
}) {
  const gradientId = `pulse-analytics-${def.key}-area${expanded ? "-full" : ""}`

  const chartData: ChartPoint[] = data.map((point, i) => ({
    date: point.date,
    label: formatChartDate(point.date),
    value: def.pick(point),
    prevValue: i > 0 ? def.pick(data[i - 1]) : null,
    seriesKey: def.key,
  }))

  const values = chartData.map((point) => point.value)
  const domain = values.length > 0 ? valueDomain(values, def.format) : [0, 1]
  const colorVar = `var(--color-${def.key})`
  const aspect = expanded ? "aspect-[16/9] min-h-[320px]" : "aspect-[16/9] min-h-[180px]"

  function onChartClick(state: unknown) {
    const payload = (
      state as {
        activePayload?: Array<{ payload?: ChartPoint }>
      } | null
    )?.activePayload?.[0]?.payload
    if (!payload || !onPointSelect) return
    onPointSelect({ date: payload.date, focusKey: def.key })
  }

  return (
    <Card
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-both border-border/60 bg-card/80 backdrop-blur-sm"
      style={{ animationDelay: `${index * CHART_STAGGER_MS}ms` }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-mono text-base tracking-tight">
            {def.title}
          </CardTitle>
          <CardDescription>
            {def.description} Click a point for day detail.
          </CardDescription>
        </div>
        {onExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Expand ${def.title} chart`}
            onClick={onExpand}
          >
            <ExpandIcon />
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!mounted ? (
          <Skeleton className={`${aspect} w-full rounded-2xl`} />
        ) : (
          <ChartContainer
            config={chartConfig}
            className={cn("chart-area-draw w-full", aspect)}
          >
            <AreaChart
              accessibilityLayer
              syncId={ANALYTICS_SYNC_ID}
              data={chartData}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
              onClick={onChartClick}
            >
              <defs>
                <ChartSeriesGradient
                  id={gradientId}
                  color={colorVar}
                  variant="area"
                />
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border/40"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
              />
              <YAxis
                domain={domain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={52}
                tickFormatter={(value: number) => formatValue(def.format, value)}
              />
              <ChartTooltip
                cursor={CHART_CURSOR}
                content={
                  <MetricTooltipContent format={def.format} title={def.title} />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                name={def.title}
                stroke={colorVar}
                strokeWidth={2.25}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={(props) => (
                  <ChartActiveDot
                    cx={props.cx}
                    cy={props.cy}
                    fill={colorVar}
                  />
                )}
                isAnimationActive
                animationDuration={CHART_ANIMATION_MS}
                animationBegin={index * CHART_STAGGER_MS}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

const subscribeMounted = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const mounted = React.useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  )
  const [expandedKey, setExpandedKey] = React.useState<KpiKey | null>(null)
  const [dayDetail, setDayDetail] = React.useState<DayDetailSelection | null>(
    null
  )
  const expandedDef = CHARTS.find((chart) => chart.key === expandedKey) ?? null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CHARTS.map((def, index) => (
          <AnalyticsMetricChart
            key={def.key}
            def={def}
            data={data}
            mounted={mounted}
            index={index}
            onExpand={() => setExpandedKey(def.key)}
            onPointSelect={setDayDetail}
          />
        ))}
      </div>

      <AnalyticsDayDetailSheet
        data={data}
        selection={dayDetail}
        onOpenChange={(open) => {
          if (!open) setDayDetail(null)
        }}
      />

      <Dialog
        open={expandedDef !== null}
        onOpenChange={(open) => {
          if (!open) setExpandedKey(null)
        }}
      >
        <DialogContent className="max-w-4xl sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-mono">
              {expandedDef?.title ?? "Chart"}
            </DialogTitle>
            <DialogDescription>
              {expandedDef?.description ?? "Fullscreen metric view."} Crosshair
              stays synced with the grid behind this dialog.
            </DialogDescription>
          </DialogHeader>
          {expandedDef ? (
            <AnalyticsMetricChart
              def={expandedDef}
              data={data}
              mounted={mounted}
              index={0}
              expanded
              onPointSelect={setDayDetail}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
