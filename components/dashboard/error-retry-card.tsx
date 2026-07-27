"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ErrorRetryCardProps = {
  title?: string
  description?: string
  digest?: string
  onRetry: () => void
}

export function ErrorRetryCard({
  title = "Something went wrong",
  description = "This section failed to load. Retry to fetch fresh data.",
  digest,
  onRetry,
}: ErrorRetryCardProps) {
  return (
    <Card className="border-dashed border-border/70 bg-card/60">
      <CardHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <AlertTriangle className="size-5" aria-hidden />
        </div>
        <CardTitle className="font-mono text-lg tracking-tight">{title}</CardTitle>
        <CardDescription className="max-w-lg">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
        {digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Ref {digest}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
