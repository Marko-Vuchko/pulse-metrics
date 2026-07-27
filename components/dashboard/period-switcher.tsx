"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import type { MetricsRange } from "@/types/metrics"
import { METRICS_RANGES } from "@/types/metrics"

const RANGE_LABELS: Record<MetricsRange, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
}

type PeriodSwitcherProps = {
  range: MetricsRange
  basePath?: string
  className?: string
}

/**
 * Period range switcher. Active state is CSS-only (no layout measurement /
 * setState) to avoid max-update-depth loops.
 */
export function PeriodSwitcher({
  range,
  basePath = "/dashboard",
  className,
}: PeriodSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Period range"
      className={cn(
        "inline-flex items-center rounded-2xl border border-border/70 bg-muted/40 p-0.5",
        className
      )}
    >
      {METRICS_RANGES.map((option) => {
        const active = option === range
        return (
          <Link
            key={option}
            href={`${basePath}?range=${option}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-[0.9rem] px-3 py-1.5 font-mono text-xs font-medium tracking-wide motion-safe:transition-[color,background-color,box-shadow] motion-safe:duration-200",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {RANGE_LABELS[option]}
          </Link>
        )
      })}
    </div>
  )
}
