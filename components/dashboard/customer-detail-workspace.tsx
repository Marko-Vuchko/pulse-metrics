"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { archiveCustomer, restoreCustomer } from "@/app/actions/customers"
import { CustomerActivityTimeline } from "@/components/dashboard/customer-activity-timeline"
import { CustomerArchiveDialog } from "@/components/dashboard/customer-archive-dialog"
import { CustomerFormDialog } from "@/components/dashboard/customer-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils"
import type {
  CustomerActivityEvent,
  CustomerDetail,
  CustomerRow,
  CustomerStatus,
} from "@/types/customers"

const STATUS_LABELS: Record<CustomerStatus, string> = {
  active: "Active",
  trial: "Trial",
  cancelled: "Cancelled",
  archived: "Archived",
}

function statusVariant(
  status: CustomerStatus
): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default"
    case "trial":
      return "secondary"
    default:
      return "outline"
  }
}

function toCustomerRow(customer: CustomerDetail): CustomerRow {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    company: customer.company,
    status: customer.status,
    mrr: customer.mrr,
    plan_name: customer.plan_name,
    created_at: customer.created_at,
  }
}

type CustomerDetailWorkspaceProps = {
  customer: CustomerDetail
  events: CustomerActivityEvent[]
}

export function CustomerDetailWorkspace({
  customer,
  events,
}: CustomerDetailWorkspaceProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [isArchiving, startArchive] = useTransition()
  const returnPath = `/dashboard/customers/${customer.id}`
  const row = toCustomerRow(customer)

  async function handleArchiveConfirm(target: CustomerRow) {
    startArchive(async () => {
      setArchiveOpen(false)
      const actionResult = await archiveCustomer(
        { id: target.id },
        "/dashboard/customers",
        { navigate: false }
      )
      if (actionResult?.error) {
        toast.error(actionResult.error)
        return
      }

      toast.message(`Archived ${target.name}`, {
        duration: 10_000,
        action: {
          label: "Undo",
          onClick: () => {
            void (async () => {
              const restored = await restoreCustomer({ id: target.id })
              if (restored.error) {
                toast.error(restored.error)
                return
              }
              toast.success("Customer restored")
              router.refresh()
            })()
          },
        },
      })
      router.push("/dashboard/customers")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <Link
            href="/dashboard/customers"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 text-muted-foreground"
            )}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Customers
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-lg font-semibold tracking-tight">
              {customer.name}
            </h2>
            <Badge variant={statusVariant(customer.status)}>
              {STATUS_LABELS[customer.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customer.status !== "archived" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <PencilIcon data-icon="inline-start" />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isArchiving}
                onClick={() => setArchiveOpen(true)}
              >
                <Trash2Icon data-icon="inline-start" />
                Archive
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailStat label="Company" value={customer.company?.trim() || "-"} />
        <DetailStat
          label="MRR"
          value={formatCurrency(Number(customer.mrr))}
          mono
        />
        <DetailStat label="Plan" value={customer.plan_name} />
        <DetailStat
          label="Created"
          value={formatDisplayDate(customer.created_at)}
          mono
        />
      </div>

      <Separator className="opacity-60" />

      <section className="space-y-4">
        <div>
          <h3 className="font-mono text-sm font-semibold tracking-tight">
            Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Timeline of key events for this account.
          </p>
        </div>
        <CustomerActivityTimeline events={events} />
      </section>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        customer={row}
        returnPath={returnPath}
        onRequestDelete={() => {
          setEditOpen(false)
          setArchiveOpen(true)
        }}
      />

      <CustomerArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        customer={row}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  )
}

function DetailStat({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          mono
            ? "mt-1 font-mono text-sm font-medium tabular-nums"
            : "mt-1 text-sm font-medium"
        }
      >
        {value}
      </p>
    </div>
  )
}
