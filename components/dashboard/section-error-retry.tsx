"use client"

import { useRouter } from "next/navigation"

import { ErrorRetryCard } from "@/components/dashboard/error-retry-card"

type SectionErrorRetryProps = {
  title?: string
  description?: string
}

/** Section-level retry that refreshes the current RSC payload. */
export function SectionErrorRetry({
  title = "Couldn't load this section",
  description = "A data request failed. Retry to refresh this section without leaving the page.",
}: SectionErrorRetryProps) {
  const router = useRouter()

  return (
    <ErrorRetryCard
      title={title}
      description={description}
      onRetry={() => {
        router.refresh()
      }}
    />
  )
}
