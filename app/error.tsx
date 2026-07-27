"use client"

import { useEffect } from "react"

import { ErrorRetryCard } from "@/components/dashboard/error-retry-card"
import { reportError } from "@/lib/observability/report-error"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <div className="bg-atmosphere flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <ErrorRetryCard
          title="PulseMetrics hit a snag"
          description="An unexpected error stopped this page. Retry, or go back and try again in a moment."
          digest={error.digest}
          onRetry={reset}
        />
      </div>
    </div>
  )
}
