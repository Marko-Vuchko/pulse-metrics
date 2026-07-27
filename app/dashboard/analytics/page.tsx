import { Suspense } from "react"

import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { AnalyticsSkeleton } from "@/components/dashboard/analytics-skeleton"
import { MarkAnalyticsExplored } from "@/components/dashboard/mark-analytics-explored"
import { MetricsEmptyState } from "@/components/dashboard/metrics-empty-state"
import { PeriodSwitcher } from "@/components/dashboard/period-switcher"
import { SectionErrorRetry } from "@/components/dashboard/section-error-retry"
import { ContentFade } from "@/components/motion/content-fade"
import { getOverviewMetrics, parseMetricsRange } from "@/lib/data/metrics"

export const metadata = {
  title: "Analytics",
  description: "PulseMetrics analytics - MRR, users, churn, and ARPU trends.",
}

type AnalyticsPageProps = {
  searchParams: Promise<{ range?: string }>
}

async function AnalyticsContent({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const params = await searchParams
  const range = parseMetricsRange(params.range)

  let metrics
  try {
    metrics = await getOverviewMetrics(range)
  } catch {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-semibold tracking-tight">
              Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Trends across MRR, users, churn, and ARPU.
            </p>
          </div>
          <PeriodSwitcher range={range} basePath="/dashboard/analytics" />
        </div>
        <SectionErrorRetry
          title="Couldn't load analytics"
          description="Chart data failed to load. Retry to fetch metric trends again."
        />
      </div>
    )
  }

  if (metrics.empty) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-mono text-lg font-semibold tracking-tight">
              Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Trends across MRR, users, churn, and ARPU.
            </p>
          </div>
          <PeriodSwitcher range={range} basePath="/dashboard/analytics" />
        </div>
        <MetricsEmptyState />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Four metric trends for the selected period.
          </p>
        </div>
        <PeriodSwitcher range={range} basePath="/dashboard/analytics" />
      </div>

      <AnalyticsCharts data={metrics.series} />
    </div>
  )
}

export default function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <ContentFade>
        <MarkAnalyticsExplored />
        <AnalyticsContent searchParams={searchParams} />
      </ContentFade>
    </Suspense>
  )
}
