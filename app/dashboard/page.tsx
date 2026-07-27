import { Suspense } from "react"

import { KpiGrid } from "@/components/dashboard/kpi-card"
import { MetricsChart } from "@/components/dashboard/metrics-chart"
import { MetricsEmptyState } from "@/components/dashboard/metrics-empty-state"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { OverviewSkeleton } from "@/components/dashboard/overview-skeleton"
import { PeriodSwitcher } from "@/components/dashboard/period-switcher"
import { SectionErrorRetry } from "@/components/dashboard/section-error-retry"
import { ContentFade } from "@/components/motion/content-fade"
import { listCustomers } from "@/lib/data/customers"
import { getOverviewMetrics, parseMetricsRange } from "@/lib/data/metrics"

export const metadata = {
  title: "Overview",
  description: "PulseMetrics overview - KPIs and MRR trend.",
}

type OverviewPageProps = {
  searchParams: Promise<{ range?: string }>
}

async function OverviewContent({
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
              Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Key metrics for your workspace.
            </p>
          </div>
          <PeriodSwitcher range={range} />
        </div>
        <SectionErrorRetry
          title="Couldn't load metrics"
          description="Overview KPIs and the MRR chart failed to load. Retry to fetch them again."
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
              Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Key metrics for your workspace.
            </p>
          </div>
          <PeriodSwitcher range={range} />
        </div>
        <OnboardingChecklist hasCustomers={false} hasMetrics={false} />
        <MetricsEmptyState />
      </div>
    )
  }

  let hasCustomers = true
  try {
    const customers = await listCustomers({ page: 1 })
    hasCustomers = customers.total > 0
  } catch {
    hasCustomers = true
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Latest KPIs versus 7 days ago, with MRR for the selected period.
          </p>
        </div>
        <PeriodSwitcher range={range} />
      </div>

      <OnboardingChecklist hasCustomers={hasCustomers} hasMetrics />
      <KpiGrid kpis={metrics.kpis} />
      <MetricsChart data={metrics.series} />
    </div>
  )
}

export default function OverviewPage({ searchParams }: OverviewPageProps) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <ContentFade>
        <OverviewContent searchParams={searchParams} />
      </ContentFade>
    </Suspense>
  )
}
