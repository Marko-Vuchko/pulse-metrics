"use client"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { CustomerRow } from "@/types/customers"

type CustomerArchiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerRow | null
  onConfirm: (customer: CustomerRow) => Promise<void>
}

export function CustomerArchiveDialog({
  open,
  onOpenChange,
  customer,
  onConfirm,
}: CustomerArchiveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete customer?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This archives ${customer?.name ?? "this customer"}. You can undo from the toast for 10 seconds.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!customer}
            onClick={(event) => {
              event.preventDefault()
              if (!customer) return
              void onConfirm(customer).catch(() => {
                toast.error("Could not archive customer.")
              })
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
