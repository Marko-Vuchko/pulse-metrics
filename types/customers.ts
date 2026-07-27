import { z } from "zod"

import type { Database } from "@/types/database"

export const customerStatusSchema = z.enum([
  "active",
  "trial",
  "cancelled",
  "archived",
])

export type CustomerStatus = z.infer<typeof customerStatusSchema>

/** Status filter UI values - All excludes archived. */
export const customerStatusFilterSchema = z.enum([
  "all",
  "active",
  "trial",
  "cancelled",
])

export type CustomerStatusFilter = z.infer<typeof customerStatusFilterSchema>

export const CUSTOMER_STATUS_FILTERS = customerStatusFilterSchema.options

export const CUSTOMER_STATUS_FILTER_LABELS: Record<
  CustomerStatusFilter,
  string
> = {
  all: "All",
  active: "Active",
  trial: "Trial",
  cancelled: "Cancelled",
}

/** Mutable statuses for create/edit/bulk (no archive). */
export const customerMutableStatusSchema = z.enum([
  "active",
  "trial",
  "cancelled",
])

export type CustomerMutableStatus = z.infer<typeof customerMutableStatusSchema>

export const CUSTOMER_MUTABLE_STATUSES = customerMutableStatusSchema.options

export const CUSTOMER_MUTABLE_STATUS_LABELS: Record<
  CustomerMutableStatus,
  string
> = {
  active: "Active",
  trial: "Trial",
  cancelled: "Cancelled",
}

export const planNameSchema = z.enum(["Basic", "Plus", "Premium"])

export type PlanName = z.infer<typeof planNameSchema>

export const PLAN_NAMES = planNameSchema.options

export const CUSTOMERS_PAGE_SIZE = 20

export const customerSortSchema = z.enum(["name", "mrr", "created_at"])

export type CustomerSort = z.infer<typeof customerSortSchema>

export const CUSTOMER_SORTS = customerSortSchema.options

export const customerSortDirSchema = z.enum(["asc", "desc"])

export type CustomerSortDir = z.infer<typeof customerSortDirSchema>

export const CUSTOMER_SORT_LABELS: Record<CustomerSort, string> = {
  name: "Name",
  mrr: "MRR",
  created_at: "Created",
}

/** Accept form strings or already-transformed numbers from the client resolver. */
const mrrSchema = z
  .union([
    z.number().finite("MRR must be a number"),
    z
      .string()
      .trim()
      .min(1, "MRR is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Use a number with up to 2 decimal places")
      .transform((value) => Number(value)),
  ])
  .refine((value) => value >= 0, "MRR must be 0 or greater")

export const customerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  company: z.string().trim(),
  status: customerMutableStatusSchema,
  mrr: mrrSchema,
  plan_name: planNameSchema,
})

export type CustomerFormInput = z.input<typeof customerFormSchema>
export type CustomerFormValues = z.infer<typeof customerFormSchema>

export const createCustomerSchema = customerFormSchema
export const updateCustomerSchema = customerFormSchema.extend({
  id: z.string().uuid("Invalid customer"),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

export const archiveCustomerSchema = z.object({
  id: z.string().uuid("Invalid customer"),
})

export type ArchiveCustomerInput = z.infer<typeof archiveCustomerSchema>

export const bulkCustomerStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "Select at least one customer"),
  status: customerMutableStatusSchema,
})

export type BulkCustomerStatusInput = z.infer<typeof bulkCustomerStatusSchema>

export type CustomerActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Partial<Record<string, string[]>>
}

export type CustomerRow = Pick<
  Database["public"]["Tables"]["customers"]["Row"],
  | "id"
  | "name"
  | "email"
  | "company"
  | "status"
  | "mrr"
  | "plan_name"
  | "created_at"
>

export type CustomerDetail = Pick<
  Database["public"]["Tables"]["customers"]["Row"],
  | "id"
  | "name"
  | "email"
  | "company"
  | "status"
  | "mrr"
  | "plan_name"
  | "created_at"
  | "updated_at"
  | "cancelled_at"
>

export type CustomerActivityKind =
  | "created"
  | "plan"
  | "status"
  | "mrr"
  | "note"
  | "cancelled"

export type CustomerActivityEvent = {
  id: string
  kind: CustomerActivityKind
  title: string
  description: string
  at: string
}

export type CustomersListResult = {
  rows: CustomerRow[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  q: string
  status: CustomerStatusFilter
  sort: CustomerSort
  dir: CustomerSortDir
}

export type CommandCustomerHit = Pick<
  CustomerRow,
  "id" | "name" | "email" | "company" | "status"
>

export function buildCustomersReturnPath(options: {
  q?: string
  status?: CustomerStatusFilter
  page?: number
  sort?: CustomerSort
  dir?: CustomerSortDir
}): string {
  const params = new URLSearchParams()
  const q = (options.q ?? "").trim()
  const status = options.status ?? "all"
  const page = options.page ?? 1
  const sort = options.sort ?? "created_at"
  const dir = options.dir ?? "desc"

  if (q) params.set("q", q)
  if (status !== "all") params.set("status", status)
  if (sort !== "created_at") params.set("sort", sort)
  if (dir !== "desc") params.set("dir", dir)
  if (page > 1) params.set("page", String(page))

  const qs = params.toString()
  return qs ? `/dashboard/customers?${qs}` : "/dashboard/customers"
}
