"use client"

import { useEffect } from "react"

import { ErrorRetryCard } from "@/components/dashboard/error-retry-card"
import { reportError } from "@/lib/observability/report-error"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col justify-center py-8">
      <ErrorRetryCard
        title="Dashboard failed to load"
        description="This dashboard view hit an error. Retry to reload the page segment."
        digest={error.digest}
        onRetry={reset}
      />
    </div>
  )
}
