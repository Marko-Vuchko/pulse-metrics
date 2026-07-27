"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CUSTOMER_MUTABLE_STATUSES,
  CUSTOMER_MUTABLE_STATUS_LABELS,
  type CustomerMutableStatus,
} from "@/types/customers"

type CustomersBulkBarProps = {
  selectedIds: string[]
  bulkStatus: CustomerMutableStatus | null
  onBulkStatusChange: (status: CustomerMutableStatus | null) => void
  onClear: () => void
  onApply: (
    ids: string[],
    status: CustomerMutableStatus
  ) => void | Promise<void>
}

export function CustomersBulkBar({
  selectedIds,
  bulkStatus,
  onBulkStatusChange,
  onClear,
  onApply,
}: CustomersBulkBarProps) {
  const [isPending, startTransition] = useTransition()
  const count = selectedIds.length

  if (count === 0) return null

  function handleApply() {
    if (!bulkStatus) {
      toast.error("Choose a status for the selected customers.")
      return
    }

    startTransition(async () => {
      await onApply(selectedIds, bulkStatus)
    })
  }

  return (
    <div className="motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:fade-in motion-safe:duration-200 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 shadow-[0_-8px_24px_-16px_oklch(0.82_0.14_200/0.35)]">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{count}</span> selected
      </p>
      <Select
        value={bulkStatus}
        onValueChange={(value) => {
          onBulkStatusChange((value as CustomerMutableStatus | null) ?? null)
        }}
        disabled={isPending}
      >
        <SelectTrigger
          aria-label="Bulk status"
          className="w-[9.5rem] border-border/70 bg-background"
        >
          <SelectValue placeholder="Set status">
            {(value: CustomerMutableStatus | null) =>
              value ? CUSTOMER_MUTABLE_STATUS_LABELS[value] : "Set status"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          {CUSTOMER_MUTABLE_STATUSES.map((option) => (
            <SelectItem key={option} value={option}>
              {CUSTOMER_MUTABLE_STATUS_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" disabled={isPending} onClick={handleApply}>
        {isPending ? "Updating..." : "Apply"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  )
}
