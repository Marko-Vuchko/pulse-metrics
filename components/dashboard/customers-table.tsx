"use client"

import Link from "next/link"
import { ChevronDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils"
import {
  CUSTOMER_MUTABLE_STATUSES,
  CUSTOMER_MUTABLE_STATUS_LABELS,
  type CustomerMutableStatus,
  type CustomerRow,
  type CustomerSort,
  type CustomerSortDir,
  type CustomerStatus,
} from "@/types/customers"

const STATUS_LABELS: Record<Exclude<CustomerStatus, "archived">, string> = {
  active: "Active",
  trial: "Trial",
  cancelled: "Cancelled",
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

function SortHeader({
  label,
  column,
  sort,
  dir,
  href,
  align = "left",
}: {
  label: string
  column: CustomerSort
  sort: CustomerSort
  dir: CustomerSortDir
  href: string
  align?: "left" | "right"
}) {
  const active = sort === column
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <Link
        href={href}
        scroll={false}
        className={cn(
          "inline-flex items-center gap-1 font-medium transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
          align === "right" && "justify-end"
        )}
      >
        {label}
        {active ? (
          <span className="font-mono text-[10px] opacity-70">
            {dir === "asc" ? "↑" : "↓"}
          </span>
        ) : null}
      </Link>
    </TableHead>
  )
}

type CustomersTableProps = {
  rows: CustomerRow[]
  selectedIds: Set<string>
  onToggleSelect: (id: string, selected: boolean) => void
  onToggleSelectAll: (selected: boolean) => void
  onRowClick: (row: CustomerRow) => void
  onStatusChange: (row: CustomerRow, status: CustomerMutableStatus) => void
  focusedIndex: number
  sort: CustomerSort
  dir: CustomerSortDir
  sortHref: (column: CustomerSort) => string
  statusPending?: boolean
}

export function CustomersTable({
  rows,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onStatusChange,
  focusedIndex,
  sort,
  dir,
  sortHref,
  statusPending = false,
}: CustomersTableProps) {
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds.has(row.id))
  const someSelected = rows.some((row) => selectedIds.has(row.id))

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                aria-label="Select all customers on this page"
                onCheckedChange={(checked) =>
                  onToggleSelectAll(checked === true)
                }
              />
            </TableHead>
            <SortHeader
              label="Name"
              column="name"
              sort={sort}
              dir={dir}
              href={sortHref("name")}
            />
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <SortHeader
              label="MRR"
              column="mrr"
              sort={sort}
              dir={dir}
              href={sortHref("mrr")}
              align="right"
            />
            <TableHead>Plan</TableHead>
            <SortHeader
              label="Created"
              column="created_at"
              sort={sort}
              dir={dir}
              href={sortHref("created_at")}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const selected = selectedIds.has(row.id)
            const focused = focusedIndex === index
            const staggerIndex = Math.min(index, 11)
            return (
              <TableRow
                key={row.id}
                data-state={selected ? "selected" : undefined}
                data-focused={focused || undefined}
                tabIndex={focused ? 0 : -1}
                className={cn(
                  "cursor-pointer motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:fill-mode-both motion-safe:duration-200",
                  "motion-safe:transition-[background-color,box-shadow] motion-safe:duration-150",
                  "hover:bg-muted/50 hover:shadow-[inset_3px_0_0_0_var(--primary)]",
                  focused &&
                    "bg-muted/60 shadow-[inset_3px_0_0_0_var(--primary)] outline-none"
                )}
                style={{ animationDelay: `${staggerIndex * 45}ms` }}
                onClick={() => onRowClick(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onRowClick(row)
                  }
                }}
              >
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={selected}
                    aria-label={`Select ${row.name}`}
                    onCheckedChange={(checked) =>
                      onToggleSelect(row.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {row.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.company ?? "-"}
                </TableCell>
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={statusPending || row.status === "archived"}
                      render={
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Change status for ${row.name}`}
                        />
                      }
                    >
                      <Badge
                        variant={statusVariant(row.status)}
                        className="gap-1 pr-1.5"
                      >
                        {STATUS_LABELS[
                          row.status as Exclude<CustomerStatus, "archived">
                        ] ?? row.status}
                        <ChevronDownIcon className="size-3 opacity-70" />
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {CUSTOMER_MUTABLE_STATUSES.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => onStatusChange(row, status)}
                        >
                          {CUSTOMER_MUTABLE_STATUS_LABELS[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCurrency(Number(row.mrr))}
                </TableCell>
                <TableCell>{row.plan_name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {formatDisplayDate(row.created_at)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
