"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"

import {
  CHART_ANIMATION_MS,
  CHART_CURSOR,
  ChartActiveDot,
  ChartSeriesGradient,
  DeltaTooltipBody,
  formatSignedDelta,
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
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatChartDate, formatCompactCurrency } from "@/lib/utils"
import type { MetricPointRow } from "@/types/metrics"

const chartConfig = {
  mrr: {
    label: "MRR",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const AREA_GRADIENT_ID = "pulse-mrr-area"
const BAR_GRADIENT_ID = "pulse-mrr-bar"

type ChartType = "line" | "bar"

type MetricsChartProps = {
  data: MetricPointRow[]
}

type ChartPoint = {
  date: string
  label: string
  mrr: number
  prevMrr: number | null
}

function mrrDomain(values: number[]): [number, number] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.15, max * 0.02, 50)
  return [Math.max(0, Math.floor(min - pad)), Math.ceil(max + pad)]
}

function MrrTooltipContent({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: ChartPoint; value?: number | string }>
}) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload
  if (!row) return null

  const value = Number(payload[0]?.value ?? row.mrr)
  const deltaLabel =
    row.prevMrr === null
      ? null
      : formatSignedDelta(value, row.prevMrr, "currency", {
          currency: formatCompactCurrency,
          number: (n) => String(n),
          percent: (n) => `${(n * 100).toFixed(1)}%`,
        })

  const deltaPositive =
    row.prevMrr === null
      ? null
      : value - row.prevMrr === 0
        ? null
        : value > row.prevMrr

  return (
    <div className="rounded-xl bg-popover/95 px-2.5 py-2 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5 backdrop-blur-sm dark:ring-foreground/10">
      <DeltaTooltipBody
        label={formatChartDate(row.date)}
        valueLabel="MRR"
        valueNode={formatCompactCurrency(value)}
        deltaLabel={deltaLabel}
        deltaPositive={deltaPositive}
      />
    </div>
  )
}

function announcePoint(point: ChartPoint) {
  const delta =
    point.prevMrr === null
      ? "no prior day"
      : formatSignedDelta(point.mrr, point.prevMrr, "currency", {
          currency: formatCompactCurrency,
          number: (n) => String(n),
          percent: (n) => `${(n * 100).toFixed(1)}%`,
        })

  toast.message(formatChartDate(point.date), {
    description: `MRR ${formatCompactCurrency(point.mrr)} · ${delta} vs prior day`,
  })
}

const subscribeMounted = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

export function MetricsChart({ data }: MetricsChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>("line")
  const [activeBarIndex, setActiveBarIndex] = React.useState<number | null>(
    null
  )
  const mounted = React.useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getMountedServerSnapshot
  )

  const chartData: ChartPoint[] = data.map((point, index) => ({
    date: point.date,
    label: formatChartDate(point.date),
    mrr: point.mrr,
    prevMrr: index > 0 ? data[index - 1].mrr : null,
  }))

  const domain =
    chartData.length > 0
      ? mrrDomain(chartData.map((point) => point.mrr))
      : [0, 1]
  const showBrush = chartData.length > 14

  function onChartClick(state: unknown) {
    const payload = (
      state as {
        activePayload?: Array<{ payload?: ChartPoint }>
      } | null
    )?.activePayload?.[0]?.payload
    if (payload) announcePoint(payload)
  }

  const brush = showBrush ? (
    <Brush
      dataKey="label"
      height={28}
      travellerWidth={10}
      stroke="var(--color-mrr)"
      fill="var(--muted)"
      className="text-[10px]"
    />
  ) : null

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-mono text-base tracking-tight">
            MRR trend
          </CardTitle>
          <CardDescription>
            Monthly recurring revenue for the selected period. Click a point for
            day detail. Drag the brush on longer ranges to zoom.
          </CardDescription>
        </div>

        <ToggleGroup
          value={[chartType]}
          onValueChange={(values) => {
            const next = values[0] as ChartType | undefined
            if (next === "line" || next === "bar") {
              setChartType(next)
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="motion-safe:transition-opacity"
          aria-label="Chart type"
        >
          <ToggleGroupItem value="line" aria-label="Line chart">
            Line
          </ToggleGroupItem>
          <ToggleGroupItem value="bar" aria-label="Bar chart">
            Bar
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>

      <CardContent>
        {!mounted ? (
          <Skeleton className="aspect-[16/7] w-full min-h-[240px] rounded-2xl" />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="chart-area-draw aspect-[16/7] w-full min-h-[240px]"
          >
            {chartType === "line" ? (
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
                onClick={onChartClick}
              >
                <defs>
                  <ChartSeriesGradient
                    id={AREA_GRADIENT_ID}
                    color="var(--color-mrr)"
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
                  minTickGap={24}
                />
                <YAxis
                  domain={domain}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(value)
                  }
                />
                <ChartTooltip
                  cursor={CHART_CURSOR}
                  content={<MrrTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  name="MRR"
                  stroke="var(--color-mrr)"
                  strokeWidth={2.25}
                  fill={`url(#${AREA_GRADIENT_ID})`}
                  dot={false}
                  activeDot={(props) => (
                    <ChartActiveDot
                      cx={props.cx}
                      cy={props.cy}
                      fill="var(--color-mrr)"
                    />
                  )}
                  isAnimationActive
                  animationDuration={CHART_ANIMATION_MS}
                  animationBegin={0}
                />
                {brush}
              </AreaChart>
            ) : (
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
                onMouseMove={(state) => {
                  const index =
                    typeof state?.activeTooltipIndex === "number"
                      ? state.activeTooltipIndex
                      : null
                  setActiveBarIndex(index)
                }}
                onMouseLeave={() => setActiveBarIndex(null)}
                onClick={onChartClick}
              >
                <defs>
                  <ChartSeriesGradient
                    id={BAR_GRADIENT_ID}
                    color="var(--color-mrr)"
                    variant="bar"
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
                  minTickGap={24}
                />
                <YAxis
                  domain={domain}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={56}
                  tickFormatter={(value: number) =>
                    formatCompactCurrency(value)
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "var(--primary)", fillOpacity: 0.08 }}
                  content={<MrrTooltipContent />}
                />
                <Bar
                  dataKey="mrr"
                  name="MRR"
                  fill={`url(#${BAR_GRADIENT_ID})`}
                  radius={[6, 6, 0, 0]}
                  isAnimationActive
                  animationDuration={CHART_ANIMATION_MS}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`mrr-bar-${index}`}
                      fillOpacity={
                        activeBarIndex === null || activeBarIndex === index
                          ? 1
                          : 0.35
                      }
                    />
                  ))}
                </Bar>
                {brush}
              </BarChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
