"use client"

import { useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CUSTOMER_STATUS_FILTER_LABELS,
  CUSTOMER_STATUS_FILTERS,
  buildCustomersReturnPath,
  type CustomerSort,
  type CustomerSortDir,
  type CustomerStatusFilter,
} from "@/types/customers"

type CustomersStatusFilterProps = {
  status: CustomerStatusFilter
  q: string
  sort: CustomerSort
  dir: CustomerSortDir
}

export function CustomersStatusFilter({
  status,
  q,
  sort,
  dir,
}: CustomersStatusFilterProps) {
  const router = useRouter()

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        if (!value) return
        router.push(
          buildCustomersReturnPath({
            q,
            status: value as CustomerStatusFilter,
            page: 1,
            sort,
            dir,
          })
        )
      }}
    >
      <SelectTrigger
        aria-label="Filter by status"
        className="w-[9.5rem] border-border/70 bg-background"
      >
        <SelectValue>
          {(value: CustomerStatusFilter | null) =>
            value ? CUSTOMER_STATUS_FILTER_LABELS[value] : "All"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {CUSTOMER_STATUS_FILTERS.map((option) => (
          <SelectItem key={option} value={option}>
            {CUSTOMER_STATUS_FILTER_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
