import { cookies } from "next/headers"

import {
  E2E_MOCK_COOKIE,
  isE2EMockAuthEnabled,
} from "@/lib/e2e/mock-auth"
import type {
  CustomerDetail,
  CustomerRow,
  CustomerStatusFilter,
  CustomersListResult,
} from "@/types/customers"
import { CUSTOMERS_PAGE_SIZE } from "@/types/customers"
import type { MetricPointRow, MetricsRange, OverviewMetrics } from "@/types/metrics"

export {
  E2E_MOCK_COOKIE,
  E2E_MOCK_USER,
  isE2EMockAuthEnabled,
} from "@/lib/e2e/mock-auth"

export async function isE2EMockSession(): Promise<boolean> {
  if (!isE2EMockAuthEnabled()) return false
  const store = await cookies()
  return store.get(E2E_MOCK_COOKIE)?.value === "1"
}

function utcToday(): string {
  return new Date().toISOString().slice(0, 10)
}

function addUtcDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

const RANGE_DAYS: Record<MetricsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

/** Deterministic metrics for mock-auth Playwright / CI. */
export function getMockOverviewMetrics(range: MetricsRange): OverviewMetrics {
  const endDate = utcToday()
  const days = RANGE_DAYS[range]
  const series: MetricPointRow[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addUtcDays(endDate, -i)
    const t = days - i
    series.push({
      date,
      mrr: 12000 + t * 85,
      active_users: 800 + t * 3,
      churn_rate: 0.028 - t * 0.0001,
      arpu: 42.5 + t * 0.05,
    })
  }

  const latest = series[series.length - 1]
  const previous =
    series.find((row) => row.date === addUtcDays(latest.date, -7)) ??
    series[0] ??
    null

  return {
    empty: false,
    range,
    kpis: [
      {
        key: "mrr",
        label: "MRR",
        value: latest.mrr,
        previousValue: previous?.mrr ?? null,
        deltaPct:
          previous && previous.mrr !== 0
            ? ((latest.mrr - previous.mrr) / Math.abs(previous.mrr)) * 100
            : null,
        inverted: false,
        format: "currency",
      },
      {
        key: "active_users",
        label: "Active Users",
        value: latest.active_users,
        previousValue: previous?.active_users ?? null,
        deltaPct:
          previous && previous.active_users !== 0
            ? ((latest.active_users - previous.active_users) /
                Math.abs(previous.active_users)) *
              100
            : null,
        inverted: false,
        format: "number",
      },
      {
        key: "churn_rate",
        label: "Churn Rate",
        value: latest.churn_rate,
        previousValue: previous?.churn_rate ?? null,
        deltaPct:
          previous && previous.churn_rate !== 0
            ? ((latest.churn_rate - previous.churn_rate) /
                Math.abs(previous.churn_rate)) *
              100
            : null,
        inverted: true,
        format: "percent",
      },
      {
        key: "arpu",
        label: "ARPU",
        value: latest.arpu,
        previousValue: previous?.arpu ?? null,
        deltaPct:
          previous && previous.arpu !== 0
            ? ((latest.arpu - previous.arpu) / Math.abs(previous.arpu)) * 100
            : null,
        inverted: false,
        format: "currency",
      },
    ],
    series,
  }
}

const MOCK_CUSTOMERS: CustomerDetail[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Acme Analytics",
    email: "ops@acme.example",
    company: "Acme Corp",
    status: "active",
    mrr: 299,
    plan_name: "Plus",
    created_at: "2026-01-10T10:00:00.000Z",
    updated_at: "2026-03-01T12:00:00.000Z",
    cancelled_at: null,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Bright Labs",
    email: "hello@bright.example",
    company: "Bright Labs",
    status: "trial",
    mrr: 49,
    plan_name: "Basic",
    created_at: "2026-02-01T10:00:00.000Z",
    updated_at: "2026-02-15T09:00:00.000Z",
    cancelled_at: null,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Orbit Systems",
    email: "billing@orbit.example",
    company: "Orbit Systems",
    status: "cancelled",
    mrr: 0,
    plan_name: "Premium",
    created_at: "2025-11-20T10:00:00.000Z",
    updated_at: "2026-01-05T14:00:00.000Z",
    cancelled_at: "2026-01-05T14:00:00.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Archived Co",
    email: "gone@archived.example",
    company: "Archived Co",
    status: "archived",
    mrr: 0,
    plan_name: "Basic",
    created_at: "2025-06-01T10:00:00.000Z",
    updated_at: "2025-12-01T08:00:00.000Z",
    cancelled_at: null,
  },
]

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

/** Single mock customer for detail page e2e. */
export function getMockCustomerById(id: string): CustomerDetail | null {
  return MOCK_CUSTOMERS.find((row) => row.id === id) ?? null
}

function sanitizeSearchTerm(term: string): string {
  return term.trim().replace(/[%_,.()]/g, "")
}

/** In-memory customers list for mock-auth Playwright / CI. */
export function listMockCustomers(options: {
  q?: string
  status?: CustomerStatusFilter
  page?: number
  sort?: "name" | "mrr" | "created_at"
  dir?: "asc" | "desc"
  pageSize?: number
}): CustomersListResult {
  const q = (options.q ?? "").trim()
  const status = options.status ?? "all"
  const requestedPage = Math.max(1, options.page ?? 1)
  const sort = options.sort ?? "created_at"
  const dir = options.dir ?? "desc"
  const pageSize = options.pageSize ?? CUSTOMERS_PAGE_SIZE
  const search = sanitizeSearchTerm(q).toLowerCase()

  let rows = MOCK_CUSTOMERS.filter((row) => {
    if (status === "all") return row.status !== "archived"
    return row.status === status
  })

  if (search) {
    rows = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(search) ||
        row.email.toLowerCase().includes(search) ||
        (row.company ?? "").toLowerCase().includes(search)
    )
  }

  const factor = dir === "asc" ? 1 : -1
  rows = [...rows].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name) * factor
    }
    if (sort === "mrr") {
      return (Number(a.mrr) - Number(b.mrr)) * factor
    }
    return (
      (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) *
      factor
    )
  })

  const total = rows.length
  const pageCount = total === 0 ? 0 : Math.ceil(total / pageSize)
  const page =
    pageCount === 0 ? 1 : Math.min(requestedPage, Math.max(1, pageCount))
  const from = (page - 1) * pageSize

  return {
    rows: rows.slice(from, from + pageSize).map(toCustomerRow),
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
