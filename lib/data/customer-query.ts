import type {
  CustomerSort,
  CustomerSortDir,
  CustomerStatusFilter,
} from "@/types/customers"
import {
  customerSortDirSchema,
  customerSortSchema,
  customerStatusFilterSchema,
} from "@/types/customers"

export function parseCustomerStatusFilter(
  value: string | undefined
): CustomerStatusFilter {
  const parsed = customerStatusFilterSchema.safeParse(value)
  return parsed.success ? parsed.data : "all"
}

export function parseCustomersPage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "1", 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export function parseCustomerSort(value: string | undefined): CustomerSort {
  const parsed = customerSortSchema.safeParse(value)
  return parsed.success ? parsed.data : "created_at"
}

export function parseCustomerSortDir(
  value: string | undefined
): CustomerSortDir {
  const parsed = customerSortDirSchema.safeParse(value)
  return parsed.success ? parsed.data : "desc"
}

/** Strip ILIKE wildcards and PostgREST or()-list separators from search input. */
export function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[%_,.()]/g, "")
}
