import { MetricsIngestWorkspace } from "@/components/dashboard/metrics-ingest-workspace"
import { ContentFade } from "@/components/motion/content-fade"
import { listRecentMetricPoints } from "@/lib/data/metrics"

export const metadata = {
  title: "Metrics",
  description: "PulseMetrics metric ingest - manual entry and CSV import.",
}

export default async function MetricsPage() {
  const recent = await listRecentMetricPoints(30)

  return (
    <ContentFade>
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Metrics ingest
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            Write daily metric points manually or via CSV. Overview and Analytics
            read from the same table.
          </p>
        </div>

        <MetricsIngestWorkspace recent={recent} />
      </div>
    </ContentFade>
  )
}
