import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compact EUR (e.g. €12.4K). en-US grouping. */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** Full EUR with up to 2 fraction digits (e.g. €890.00). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** ISO/timestamptz → DD MMM YYYY (UTC). */
export function formatDisplayDate(value: string): string {
  const date = new Date(value)
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/** Compact number (e.g. 1.8K). en-US grouping. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** Decimal rate (0.024) → percent string (2.4%). */
export function formatPercentRate(rate: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate)
}

/** Relative delta as +4.2% / -0.3%. */
export function formatDeltaPercent(deltaPct: number): string {
  const sign = deltaPct > 0 ? "+" : ""
  return `${sign}${deltaPct.toFixed(1)}%`
}

/** ISO date (YYYY-MM-DD) → short chart label (e.g. 23 Jul). */
export function formatChartDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date)
}

/** Relative label for notification timestamps (e.g. 2h ago). */
export function formatRelativeTime(iso: string, nowMs = Date.now()): string {
  const diffMs = Math.max(0, nowMs - new Date(iso).getTime())
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return formatDisplayDate(iso)
}
