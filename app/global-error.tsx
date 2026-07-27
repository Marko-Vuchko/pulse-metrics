"use client"

import { useEffect } from "react"

import { ErrorRetryCard } from "@/components/dashboard/error-retry-card"
import { reportError } from "@/lib/observability/report-error"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-full flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <ErrorRetryCard
            title="PulseMetrics hit a snag"
            description="An unexpected error stopped the app shell. Retry, or reload in a moment."
            digest={error.digest}
            onRetry={reset}
          />
        </div>
      </body>
    </html>
  )
}
