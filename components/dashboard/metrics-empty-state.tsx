import Link from "next/link"
import { Activity } from "lucide-react"

import { LoadSampleDataButton } from "@/components/dashboard/load-sample-data-button"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MetricsEmptyState() {
  return (
    <Card className="border-dashed border-border/70 bg-card/60">
      <CardHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Activity className="size-5" aria-hidden />
        </div>
        <CardTitle className="font-mono text-lg tracking-tight">
          No metrics yet
        </CardTitle>
        <CardDescription className="max-w-lg">
          New workspaces start empty. Load a demo sample to explore KPIs and
          charts, or use the demo login for the full seeded tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <LoadSampleDataButton />
        <Link
          href="/#demo-credentials"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View demo credentials
        </Link>
      </CardContent>
    </Card>
  )
}
