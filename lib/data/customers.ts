import { sanitizeSearchTerm } from "@/lib/data/customer-query"
import {
  getMockCustomerById,
  isE2EMockSession,
  listMockCustomers,
} from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"
import type {
  CommandCustomerHit,
  CustomerDetail,
  CustomerRow,
  CustomerSort,
  CustomerSortDir,
  CustomerStatusFilter,
  CustomersListResult,
} from "@/types/customers"
import { CUSTOMERS_PAGE_SIZE } from "@/types/customers"

export {
  parseCustomerSort,
  parseCustomerSortDir,
  parseCustomerStatusFilter,
  parseCustomersPage,
  sanitizeSearchTerm,
} from "@/lib/data/customer-query"

function emptyResult(
  q: string,
  status: CustomerStatusFilter,
  page: number,
  sort: CustomerSort,
  dir: CustomerSortDir
): CustomersListResult {
  return {
    rows: [],
    total: 0,
    page,
    pageSize: CUSTOMERS_PAGE_SIZE,
    pageCount: 0,
    q,
    status,
    sort,
    dir,
  }
}

/**
 * Paginated customers for the authenticated tenant.
 * Default sort: created_at desc. "All" excludes archived.
 */
export async function listCustomers(options: {
  q?: string
  status?: CustomerStatusFilter
  page?: number
  sort?: CustomerSort
  dir?: CustomerSortDir
}): Promise<CustomersListResult> {
  const q = (options.q ?? "").trim()
  const status = options.status ?? "all"
  const requestedPage = Math.max(1, options.page ?? 1)
  const sort = options.sort ?? "created_at"
  const dir = options.dir ?? "desc"
  const search = sanitizeSearchTerm(q)
  const ascending = dir === "asc"

  if (await isE2EMockSession()) {
    return listMockCustomers({
      q,
      status,
      page: requestedPage,
      sort,
      dir,
    })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return emptyResult(q, status, requestedPage, sort, dir)
  }

  let countQuery = supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", user.id)

  if (status === "all") {
    countQuery = countQuery.neq("status", "archived")
  } else {
    countQuery = countQuery.eq("status", status)
  }

  if (search) {
    countQuery = countQuery.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    throw new Error(`Failed to count customers: ${countError.message}`)
  }

  const total = count ?? 0
  const pageCount = total === 0 ? 0 : Math.ceil(total / CUSTOMERS_PAGE_SIZE)
  const page =
    pageCount === 0 ? 1 : Math.min(requestedPage, Math.max(1, pageCount))

  if (total === 0) {
    return emptyResult(q, status, 1, sort, dir)
  }

  const from = (page - 1) * CUSTOMERS_PAGE_SIZE
  const to = from + CUSTOMERS_PAGE_SIZE - 1

  let listQuery = supabase
    .from("customers")
    .select("id, name, email, company, status, mrr, plan_name, created_at")
    .eq("tenant_id", user.id)

  if (status === "all") {
    listQuery = listQuery.neq("status", "archived")
  } else {
    listQuery = listQuery.eq("status", status)
  }

  if (search) {
    listQuery = listQuery.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { data, error } = await listQuery
    .order(sort, { ascending })
    .range(from, to)

  if (error) {
    throw new Error(`Failed to load customers: ${error.message}`)
  }

  return {
    rows: (data ?? []) as CustomerRow[],
    total,
    page,
    pageSize: CUSTOMERS_PAGE_SIZE,
    pageCount,
    q,
    status,
    sort,
    dir,
  }
}

/** Single customer for the detail page (tenant-scoped via RLS). */
export async function getCustomerById(
  id: string
): Promise<CustomerDetail | null> {
  if (await isE2EMockSession()) {
    return getMockCustomerById(id)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, name, email, company, status, mrr, plan_name, created_at, updated_at, cancelled_at"
    )
    .eq("tenant_id", user.id)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load customer: ${error.message}`)
  }

  return (data as CustomerDetail | null) ?? null
}

/** Lightweight fuzzy list for the command palette (name, email, company). */
export async function searchCustomersForCommand(
  q: string,
  limit = 8
): Promise<CommandCustomerHit[]> {
  const search = sanitizeSearchTerm(q)
  const capped = Math.min(Math.max(limit, 1), 20)

  if (await isE2EMockSession()) {
    const result = listMockCustomers({
      q: search,
      status: "all",
      page: 1,
      sort: "name",
      dir: "asc",
    })
    return result.rows.slice(0, capped).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company,
      status: row.status,
    }))
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from("customers")
    .select("id, name, email, company, status")
    .eq("tenant_id", user.id)
    .neq("status", "archived")
    .order("name", { ascending: true })
    .limit(capped)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`Failed to search customers: ${error.message}`)
  }

  return (data ?? []) as CommandCustomerHit[]
}

/** All matching (non-archived unless filtered) rows for CSV export. */
export async function listCustomersForExport(options: {
  q?: string
  status?: CustomerStatusFilter
  sort?: CustomerSort
  dir?: CustomerSortDir
}): Promise<CustomerRow[]> {
  const q = (options.q ?? "").trim()
  const status = options.status ?? "all"
  const sort = options.sort ?? "created_at"
  const dir = options.dir ?? "desc"
  const search = sanitizeSearchTerm(q)
  const ascending = dir === "asc"

  if (await isE2EMockSession()) {
    const result = listMockCustomers({
      q,
      status,
      page: 1,
      sort,
      dir,
      pageSize: 10_000,
    })
    return result.rows
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  let listQuery = supabase
    .from("customers")
    .select("id, name, email, company, status, mrr, plan_name, created_at")
    .eq("tenant_id", user.id)

  if (status === "all") {
    listQuery = listQuery.neq("status", "archived")
  } else {
    listQuery = listQuery.eq("status", status)
  }

  if (search) {
    listQuery = listQuery.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
    )
  }

  const { data, error } = await listQuery
    .order(sort, { ascending })
    .limit(5000)

  if (error) {
    throw new Error(`Failed to export customers: ${error.message}`)
  }

  return (data ?? []) as CustomerRow[]
}
