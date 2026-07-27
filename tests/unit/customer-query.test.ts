import { describe, expect, it } from "vitest"

import {
  parseCustomerSort,
  parseCustomerSortDir,
  parseCustomerStatusFilter,
  parseCustomersPage,
  sanitizeSearchTerm,
} from "@/lib/data/customer-query"
import { buildUpdateActivityDiff } from "@/lib/data/customer-activity"

describe("customer query helpers", () => {
  it("parses list query pieces with safe defaults", () => {
    expect(parseCustomerStatusFilter("trial")).toBe("trial")
    expect(parseCustomerStatusFilter("archived")).toBe("all")
    expect(parseCustomersPage("3")).toBe(3)
    expect(parseCustomersPage("0")).toBe(1)
    expect(parseCustomersPage("abc")).toBe(1)
    expect(parseCustomerSort("mrr")).toBe("mrr")
    expect(parseCustomerSort("revenue")).toBe("created_at")
    expect(parseCustomerSortDir("asc")).toBe("asc")
    expect(parseCustomerSortDir("sideways")).toBe("desc")
  })

  it("sanitizes PostgREST-sensitive search characters", () => {
    expect(sanitizeSearchTerm("  acme%_,.()  ")).toBe("acme")
    expect(sanitizeSearchTerm("hello world")).toBe("hello world")
  })
})

describe("buildUpdateActivityDiff", () => {
  it("emits plan, status, and mrr events when fields change", () => {
    const events = buildUpdateActivityDiff({
      tenantId: "tenant",
      customerId: "cust",
      before: {
        name: "Acme",
        status: "trial",
        mrr: 10,
        plan_name: "Basic",
      },
      after: {
        name: "Acme",
        status: "cancelled",
        mrr: 25,
        plan_name: "Plus",
      },
    })

    expect(events.map((event) => event.kind).sort()).toEqual([
      "cancelled",
      "mrr",
      "plan",
    ])
  })

  it("falls back to a note when only the name changes", () => {
    const events = buildUpdateActivityDiff({
      tenantId: "tenant",
      customerId: "cust",
      before: {
        name: "Acme",
        status: "active",
        mrr: 10,
        plan_name: "Plus",
      },
      after: {
        name: "Acme Corp",
        status: "active",
        mrr: 10,
        plan_name: "Plus",
      },
    })

    expect(events).toHaveLength(1)
    expect(events[0]?.kind).toBe("note")
  })
})
