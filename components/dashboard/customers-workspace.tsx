"use client"

import { useEffect, useMemo, useOptimistic, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"

import {
  archiveCustomer,
  bulkUpdateCustomerStatus,
  exportCustomersCsv,
  restoreCustomer,
  updateCustomerStatus,
} from "@/app/actions/customers"
import { CustomerArchiveDialog } from "@/components/dashboard/customer-archive-dialog"
import { CustomerFormDialog } from "@/components/dashboard/customer-form-dialog"
import { CustomersBulkBar } from "@/components/dashboard/customers-bulk-bar"
import { CustomersEmptyState } from "@/components/dashboard/customers-empty-state"
import { CustomersPagination } from "@/components/dashboard/customers-pagination"
import { CustomersSearch } from "@/components/dashboard/customers-search"
import { CustomersStatusFilter } from "@/components/dashboard/customers-status-filter"
import { CustomersTable } from "@/components/dashboard/customers-table"
import { Button } from "@/components/ui/button"
import {
  CUSTOMER_MUTABLE_STATUS_LABELS,
  buildCustomersReturnPath,
  type CustomerMutableStatus,
  type CustomerRow,
  type CustomerSort,
  type CustomersListResult,
} from "@/types/customers"

type CustomersWorkspaceProps = {
  result: CustomersListResult
  initialCreate?: boolean
  initialEditId?: string | null
}

type OptimisticAction =
  | { type: "status"; id: string; status: CustomerMutableStatus }
  | { type: "bulk"; ids: string[]; status: CustomerMutableStatus }
  | { type: "remove"; id: string }

function applyOptimistic(
  rows: CustomerRow[],
  action: OptimisticAction
): CustomerRow[] {
  switch (action.type) {
    case "status":
      return rows.map((row) =>
        row.id === action.id ? { ...row, status: action.status } : row
      )
    case "bulk":
      return rows.map((row) =>
        action.ids.includes(row.id) ? { ...row, status: action.status } : row
      )
    case "remove":
      return rows.filter((row) => row.id !== action.id)
  }
}

export function CustomersWorkspace({
  result,
  initialCreate = false,
  initialEditId = null,
}: CustomersWorkspaceProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(initialCreate)
  const [createKey, setCreateKey] = useState(initialCreate ? 1 : 0)
  const [editCustomer, setEditCustomer] = useState<CustomerRow | null>(() => {
    if (!initialEditId) return null
    return result.rows.find((row) => row.id === initialEditId) ?? null
  })
  const [archiveTarget, setArchiveTarget] = useState<CustomerRow | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<CustomerMutableStatus | null>(
    null
  )
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [selectionScope, setSelectionScope] = useState(() =>
    result.rows.map((row) => row.id).join(",")
  )
  const [isMutating, startMutation] = useTransition()
  const [, startExport] = useTransition()
  const [optimisticRows, applyOptimisticRows] = useOptimistic(
    result.rows,
    applyOptimistic
  )

  const rowIdsKey = result.rows.map((row) => row.id).join(",")
  if (selectionScope !== rowIdsKey) {
    setSelectionScope(rowIdsKey)
    setSelectedIds((prev) => (prev.size === 0 ? prev : new Set()))
    setBulkStatus((prev) => (prev === null ? prev : null))
    setFocusedIndex((prev) => (prev === 0 ? prev : 0))
  }

  const returnPath = useMemo(
    () =>
      buildCustomersReturnPath({
        q: result.q,
        status: result.status,
        page: result.page,
        sort: result.sort,
        dir: result.dir,
      }),
    [result.q, result.status, result.page, result.sort, result.dir]
  )

  useEffect(() => {
    if (!initialCreate && !initialEditId) return
    router.replace(returnPath, { scroll: false })
    // router identity from useRouter() is not stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when deep-link flags/path change
  }, [initialCreate, initialEditId, returnPath])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }
      if (optimisticRows.length === 0) return

      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault()
        setFocusedIndex((index) =>
          Math.min(optimisticRows.length - 1, index + 1)
        )
      } else if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault()
        setFocusedIndex((index) => Math.max(0, index - 1))
      } else if (event.key === "Enter") {
        const row = optimisticRows[focusedIndex]
        if (row) {
          event.preventDefault()
          router.push(`/dashboard/customers/${row.id}`)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [focusedIndex, optimisticRows, router])

  const hasFilters = Boolean(result.q) || result.status !== "all"
  const isEmpty = result.total === 0
  const editOpen = editCustomer !== null

  function openCreate() {
    setCreateKey((key) => key + 1)
    setCreateOpen(true)
  }

  function toggleSelect(id: string, selected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleSelectAll(selected: boolean) {
    if (selected) {
      setSelectedIds(new Set(optimisticRows.map((row) => row.id)))
      return
    }
    setSelectedIds(new Set())
  }

  function handleRequestDelete() {
    if (!editCustomer) return
    setArchiveTarget(editCustomer)
    setEditCustomer(null)
  }

  function sortHref(column: CustomerSort): string {
    const nextDir =
      result.sort === column && result.dir === "asc" ? "desc" : "asc"
    const dir =
      result.sort === column
        ? nextDir
        : column === "created_at"
          ? "desc"
          : "asc"
    return buildCustomersReturnPath({
      q: result.q,
      status: result.status,
      page: 1,
      sort: column,
      dir,
    })
  }

  function handleExport() {
    startExport(async () => {
      const exported = await exportCustomersCsv({
        q: result.q,
        status: result.status,
        sort: result.sort,
        dir: result.dir,
      })
      if (exported.error || !exported.csv || !exported.filename) {
        toast.error(exported.error ?? "Export failed.")
        return
      }
      const blob = new Blob([exported.csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = exported.filename
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success("CSV downloaded")
    })
  }

  function handleStatusChange(
    row: CustomerRow,
    status: CustomerMutableStatus
  ) {
    if (row.status === status) return
    startMutation(async () => {
      applyOptimisticRows({ type: "status", id: row.id, status })
      const actionResult = await updateCustomerStatus(
        { id: row.id, status },
        returnPath,
        { navigate: false }
      )
      if (actionResult?.error) {
        toast.error(actionResult.error)
        router.refresh()
        return
      }
      toast.success(
        `Status set to ${CUSTOMER_MUTABLE_STATUS_LABELS[status]}`
      )
      router.refresh()
    })
  }

  function handleBulkApply(ids: string[], status: CustomerMutableStatus) {
    startMutation(async () => {
      applyOptimisticRows({ type: "bulk", ids, status })
      const actionResult = await bulkUpdateCustomerStatus(
        { ids, status },
        returnPath,
        { navigate: false }
      )
      if (actionResult?.error) {
        toast.error(actionResult.error)
        router.refresh()
        return
      }
      setSelectedIds(new Set())
      setBulkStatus(null)
      toast.success("Status updated")
      router.refresh()
    })
  }

  async function handleArchiveConfirm(customer: CustomerRow) {
    startMutation(async () => {
      applyOptimisticRows({ type: "remove", id: customer.id })
      setArchiveTarget(null)
      const actionResult = await archiveCustomer(
        { id: customer.id },
        returnPath,
        { navigate: false }
      )
      if (actionResult?.error) {
        toast.error(actionResult.error)
        router.refresh()
        return
      }

      toast.message(`Archived ${customer.name}`, {
        duration: 10_000,
        action: {
          label: "Undo",
          onClick: () => {
            void (async () => {
              const restored = await restoreCustomer({ id: customer.id })
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
      router.refresh()
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-lg font-semibold tracking-tight">
            Customers
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEmpty
              ? "Manage your customer roster."
              : `${result.total} customer${result.total === 1 ? "" : "s"}`}
            {!isEmpty ? (
              <span className="ml-2 hidden font-mono text-xs sm:inline">
                j/k to move · Enter to open
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEmpty ? (
            <Button
              type="button"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={handleExport}
            >
              <Download data-icon="inline-start" />
              Export CSV
            </Button>
          ) : null}
          <Button
            type="button"
            className="hidden sm:inline-flex"
            onClick={openCreate}
          >
            <Plus data-icon="inline-start" />
            Add customer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CustomersSearch
          q={result.q}
          status={result.status}
          sort={result.sort}
          dir={result.dir}
        />
        <CustomersStatusFilter
          status={result.status}
          q={result.q}
          sort={result.sort}
          dir={result.dir}
        />
      </div>

      <CustomersBulkBar
        selectedIds={[...selectedIds]}
        bulkStatus={bulkStatus}
        onBulkStatusChange={setBulkStatus}
        onClear={() => {
          setSelectedIds(new Set())
          setBulkStatus(null)
        }}
        onApply={handleBulkApply}
      />

      {isEmpty ? (
        <CustomersEmptyState filtered={hasFilters} onAdd={openCreate} />
      ) : (
        <>
          <CustomersTable
            rows={optimisticRows}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={(row) => router.push(`/dashboard/customers/${row.id}`)}
            onStatusChange={handleStatusChange}
            focusedIndex={focusedIndex}
            sort={result.sort}
            dir={result.dir}
            sortHref={sortHref}
            statusPending={isMutating}
          />
          <CustomersPagination
            page={result.page}
            pageCount={result.pageCount}
            q={result.q}
            status={result.status}
            sort={result.sort}
            dir={result.dir}
          />
        </>
      )}

      <Button
        type="button"
        size="icon-lg"
        aria-label="Add customer"
        className="fixed right-4 bottom-4 z-20 shadow-lg sm:hidden"
        onClick={openCreate}
      >
        <Plus />
      </Button>

      <CustomerFormDialog
        key={`create-customer-${createKey}`}
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        returnPath={returnPath}
      />

      <CustomerFormDialog
        key={editCustomer?.id ?? "edit-customer"}
        open={editOpen}
        onOpenChange={(open) => {
          if (!open) setEditCustomer(null)
        }}
        mode="edit"
        customer={editCustomer}
        returnPath={returnPath}
        onRequestDelete={handleRequestDelete}
      />

      <CustomerArchiveDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        customer={archiveTarget}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  )
}
