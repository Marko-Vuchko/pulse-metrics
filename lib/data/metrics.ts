import {
  getMockOverviewMetrics,
  isE2EMockSession,
} from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"
import type {
  KpiCardData,
  MetricPointListItem,
  MetricPointRow,
  MetricsRange,
  OverviewMetrics,
} from "@/types/metrics"
import { metricsRangeSchema } from "@/types/metrics"

const RANGE_DAYS: Record<MetricsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

export function parseMetricsRange(value: string | undefined): MetricsRange {
  const parsed = metricsRangeSchema.safeParse(value)
  return parsed.success ? parsed.data : "7d"
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function addUtcDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function relativeDeltaPct(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null
  }
  return ((current - previous) / Math.abs(previous)) * 100
}

function buildKpis(
  latest: MetricPointRow,
  previous: MetricPointRow | null
): KpiCardData[] {
  const defs: Array<{
    key: KpiCardData["key"]
    label: string
    format: KpiCardData["format"]
    inverted: boolean
    pick: (row: MetricPointRow) => number
  }> = [
    {
      key: "mrr",
      label: "MRR",
      format: "currency",
      inverted: false,
      pick: (row) => row.mrr,
    },
    {
      key: "active_users",
      label: "Active Users",
      format: "number",
      inverted: false,
      pick: (row) => row.active_users,
    },
    {
      key: "churn_rate",
      label: "Churn Rate",
      format: "percent",
      inverted: true,
      pick: (row) => row.churn_rate,
    },
    {
      key: "arpu",
      label: "ARPU",
      format: "currency",
      inverted: false,
      pick: (row) => row.arpu,
    },
  ]

  return defs.map((def) => {
    const value = def.pick(latest)
    const previousValue = previous ? def.pick(previous) : null
    const deltaPct =
      previousValue === null ? null : relativeDeltaPct(value, previousValue)

    return {
      key: def.key,
      label: def.label,
      value,
      previousValue,
      deltaPct,
      inverted: def.inverted,
      format: def.format,
    }
  })
}

function emptyOverview(range: MetricsRange): OverviewMetrics {
  return {
    empty: true,
    range,
    kpis: [],
    series: [],
  }
}

/**
 * Overview metrics for the authenticated tenant.
 * KPIs: latest day vs the point 7 days earlier.
 * Series: last N days for the requested range (default 7d).
 */
export async function getOverviewMetrics(
  range: MetricsRange = "7d"
): Promise<OverviewMetrics> {
  if (await isE2EMockSession()) {
    return getMockOverviewMetrics(range)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return emptyOverview(range)
  }

  const endDate = utcToday()
  const seriesStart = addUtcDays(endDate, -(RANGE_DAYS[range] - 1))
  // Pull enough history for series + 7-day KPI baseline in one query.
  const historyStart = addUtcDays(endDate, -Math.max(RANGE_DAYS[range], 8) + 1)

  const { data, error } = await supabase
    .from("metric_points")
    .select("date, mrr, active_users, churn_rate, arpu")
    .eq("tenant_id", user.id)
    .gte("date", historyStart)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    throw new Error(`Failed to load metrics: ${error.message}`)
  }

  const rows = (data ?? []) as MetricPointRow[]

  if (rows.length === 0) {
    return emptyOverview(range)
  }

  const latest = rows[rows.length - 1]
  const baselineDate = addUtcDays(latest.date, -7)
  const previous =
    rows.find((row) => row.date === baselineDate) ??
    [...rows].reverse().find((row) => row.date < baselineDate) ??
    null

  const series = rows.filter((row) => row.date >= seriesStart)

  return {
    empty: false,
    range,
    kpis: buildKpis(latest, previous),
    series,
  }
}

/** Series-only helper for Analytics (P10) and shared range charts. */
export async function getMetricSeries(
  range: MetricsRange = "7d"
): Promise<MetricPointRow[]> {
  const overview = await getOverviewMetrics(range)
  return overview.series
}

/**
 * Recent metric points for the ingest workspace (newest first).
 */
export async function listRecentMetricPoints(
  limit = 30
): Promise<MetricPointListItem[]> {
  if (await isE2EMockSession()) {
    const overview = await getOverviewMetrics("30d")
    return overview.series
      .slice()
      .reverse()
      .slice(0, limit)
      .map((row, index) => ({
        ...row,
        id: `mock-metric-${index}`,
      }))
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("metric_points")
    .select("id, date, mrr, active_users, churn_rate, arpu")
    .eq("tenant_id", user.id)
    .order("date", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to list metrics: ${error.message}`)
  }

  return (data ?? []) as MetricPointListItem[]
}
