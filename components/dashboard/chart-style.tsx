"use client"

import type { ReactNode } from "react"

type ChartSeriesGradientProps = {
  /** Unique id for the SVG gradient (must be unique per chart instance). */
  id: string
  /** CSS color var, e.g. `var(--color-mrr)` or `var(--chart-1)`. */
  color: string
  /** Bar vertical gradient uses higher mid opacity. */
  variant?: "area" | "bar"
}

/** SVG defs for cyan/token gradient fills under Area / Bar series. */
function ChartSeriesGradient({
  id,
  color,
  variant = "area",
}: ChartSeriesGradientProps) {
  if (variant === "bar") {
    return (
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.95} />
        <stop offset="100%" stopColor={color} stopOpacity={0.35} />
      </linearGradient>
    )
  }

  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.38} />
      <stop offset="55%" stopColor={color} stopOpacity={0.12} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  )
}

type ChartActiveDotProps = {
  cx?: number
  cy?: number
  fill?: string
}

/** Ringed active point for scrub hover. */
function ChartActiveDot({
  cx = 0,
  cy = 0,
  fill = "var(--primary)",
}: ChartActiveDotProps) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={fill}
        fillOpacity={0.18}
        stroke="none"
      />
      <circle
        cx={cx}
        cy={cy}
        r={4.5}
        fill={fill}
        stroke="var(--background)"
        strokeWidth={2.5}
      />
    </g>
  )
}

const CHART_CURSOR = {
  stroke: "var(--primary)",
  strokeWidth: 1,
  strokeDasharray: "4 4",
  strokeOpacity: 0.55,
} as const

const CHART_ANIMATION_MS = 720

const CHART_STAGGER_MS = 90

type ValueFormat = "currency" | "number" | "percent"

function formatSignedDelta(
  current: number,
  previous: number,
  format: ValueFormat,
  formatters: {
    currency: (n: number) => string
    number: (n: number) => string
    percent: (n: number) => string
  }
): string | null {
  const delta = current - previous
  if (!Number.isFinite(delta) || delta === 0) {
    return format === "percent" ? "0%" : format === "currency" ? "€0" : "0"
  }

  const sign = delta > 0 ? "+" : "-"
  const abs = Math.abs(delta)

  switch (format) {
    case "currency":
      return `${sign}${formatters.currency(abs)}`
    case "percent":
      return `${sign}${formatters.percent(abs)}`
    case "number":
      return `${sign}${formatters.number(abs)}`
  }
}

type DeltaTooltipBodyProps = {
  label: ReactNode
  valueLabel: string
  valueNode: ReactNode
  deltaLabel: string | null
  deltaPositive: boolean | null
}

function DeltaTooltipBody({
  label,
  valueLabel,
  valueNode,
  deltaLabel,
  deltaPositive,
}: DeltaTooltipBodyProps) {
  return (
    <div className="grid min-w-36 gap-1.5">
      <div className="font-mono text-[11px] tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-muted-foreground">{valueLabel}</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {valueNode}
        </span>
      </div>
      {deltaLabel ? (
        <p
          className={
            deltaPositive === null
              ? "font-mono text-[11px] tabular-nums text-muted-foreground"
              : deltaPositive
                ? "font-mono text-[11px] tabular-nums text-success"
                : "font-mono text-[11px] tabular-nums text-destructive"
          }
        >
          {deltaLabel}
          <span className="ml-1 text-muted-foreground">vs prior day</span>
        </p>
      ) : null}
    </div>
  )
}

export {
  ChartSeriesGradient,
  ChartActiveDot,
  CHART_CURSOR,
  CHART_ANIMATION_MS,
  CHART_STAGGER_MS,
  formatSignedDelta,
  DeltaTooltipBody,
}
export type { ValueFormat }
