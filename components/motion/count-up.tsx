"use client"

import {
  cn,
  formatCompactCurrency,
  formatCompactNumber,
  formatPercentRate,
} from "@/lib/utils"

type CountUpFormat = "currency" | "percent" | "number"

function formatValue(format: CountUpFormat, value: number): string {
  switch (format) {
    case "currency":
      return formatCompactCurrency(value)
    case "percent":
      return formatPercentRate(value)
    case "number":
      return formatCompactNumber(value)
  }
}

type CountUpProps = {
  value: number
  /** Serialisable format kind - do not pass a function from Server Components. */
  format: CountUpFormat
  className?: string
}

/**
 * KPI value display. Intentionally has no setState / rAF tween - a prior
 * count-up implementation caused max-update-depth loops under React 19.
 * Enter motion is CSS-only via the parent card stagger.
 */
function CountUp({ value, format, className }: CountUpProps) {
  const label = formatValue(format, value)
  return (
    <span className={cn("tabular-nums", className)} aria-label={label}>
      {label}
    </span>
  )
}

export { CountUp }
export type { CountUpFormat }
