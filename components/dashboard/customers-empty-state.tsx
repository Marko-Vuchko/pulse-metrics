"use client"

import { Plus, Users } from "lucide-react"

import { LoadSampleDataButton } from "@/components/dashboard/load-sample-data-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CustomersEmptyStateProps = {
  /** True when filters/search produced zero rows but the tenant may have customers. */
  filtered?: boolean
  onAdd?: () => void
}

export function CustomersEmptyState({
  filtered = false,
  onAdd,
}: CustomersEmptyStateProps) {
  return (
    <Card className="border-dashed border-border/70 bg-card/60">
      <CardHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Users className="size-5" aria-hidden />
        </div>
        <CardTitle className="font-mono text-lg tracking-tight">
          {filtered ? "No matching customers" : "Add first customer"}
        </CardTitle>
        <CardDescription className="max-w-lg">
          {filtered
            ? "Try a different search or status filter. Archived customers stay hidden from All."
            : "Your customer list is empty. Create your first customer, or load demo sample data to explore the workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {!filtered && (
          <>
            <Button type="button" onClick={onAdd}>
              <Plus data-icon="inline-start" />
              Add customer
            </Button>
            <LoadSampleDataButton variant="outline" />
          </>
        )}
      </CardContent>
    </Card>
  )
}
