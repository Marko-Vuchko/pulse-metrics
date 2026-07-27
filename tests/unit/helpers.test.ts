import { describe, expect, it } from "vitest"

import { getBillingTier } from "@/lib/billing/plans"
import { parseMetricsRange } from "@/lib/data/metrics"
import {
  buildCreatedActivity,
  buildCustomerActivityTimeline,
} from "@/lib/data/customer-activity"
import {
  parseMetricsCsv,
  METRICS_CSV_TEMPLATE,
  serializeMetricsCsv,
} from "@/lib/metrics/csv"
import {
  formatChartDate,
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatDeltaPercent,
  formatDisplayDate,
  formatPercentRate,
  formatRelativeTime,
} from "@/lib/utils"
import type { CustomerDetail } from "@/types/customers"

describe("parse helpers", () => {
  it("falls back to safe metrics range defaults", () => {
    expect(parseMetricsRange("30d")).toBe("30d")
    expect(parseMetricsRange("nope")).toBe("7d")
    expect(parseMetricsRange(undefined)).toBe("7d")
  })
})

describe("format helpers", () => {
  it("formats currency and compact numbers", () => {
    expect(formatCurrency(890)).toMatch(/€890\.00/)
    expect(formatCompactCurrency(12_400)).toMatch(/€12\.4K|€12,4K/)
    expect(formatCompactNumber(1800)).toMatch(/1\.8K|1,8K/)
  })

  it("formats percent and deltas", () => {
    expect(formatPercentRate(0.024)).toBe("2.4%")
    expect(formatDeltaPercent(4.2)).toBe("+4.2%")
    expect(formatDeltaPercent(-0.3)).toBe("-0.3%")
  })

  it("formats UTC dates for tables and charts", () => {
    expect(formatDisplayDate("2026-07-23T12:00:00.000Z")).toBe("23 Jul 2026")
    expect(formatChartDate("2026-07-23")).toBe("23 Jul")
  })
})

describe("metrics CSV helper", () => {
  it("parses the template CSV", () => {
    const result = parseMetricsCsv(METRICS_CSV_TEMPLATE)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].date).toBe("2026-07-01")
      expect(result.rows[0].mrr).toBe(12450)
    }
  })

  it("rejects missing headers and empty files", () => {
    expect(parseMetricsCsv("date,mrr\n2026-07-01,1").ok).toBe(false)
    expect(parseMetricsCsv("date,mrr,active_users,churn_rate,arpu").ok).toBe(
      false
    )
  })

  it("surfaces row-level validation errors", () => {
    const result = parseMetricsCsv(
      "date,mrr,active_users,churn_rate,arpu\n2026-07-01,bad,10,0.1,5"
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/^Row 2:/)
    }
  })

  it("parses quoted CSV cells", () => {
    const result = parseMetricsCsv(
      'date,mrr,active_users,churn_rate,arpu\n"2026-07-01",12450,812,0.024,42.10'
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.rows[0]?.date).toBe("2026-07-01")
      expect(result.rows[0]?.mrr).toBe(12450)
    }
  })

  it("escapes quotes when serializing", () => {
    const csv = serializeMetricsCsv([
      {
        date: '2026-07-01,"x"',
        mrr: 1,
        active_users: 2,
        churn_rate: 0.1,
        arpu: 3,
      },
    ])
    expect(csv).toContain('"2026-07-01,""x"""')
  })
})

describe("billing helper", () => {
  it("resolves known tiers and falls back to Basic", () => {
    expect(getBillingTier("Plus").priceMonthly).toBe(29)
    expect(getBillingTier("Basic").name).toBe("Basic")
  })
})

describe("customer activity helper", () => {
  it("builds a deterministic timeline from customer fields", () => {
    const customer: CustomerDetail = {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Acme Co",
      email: "ops@acme.test",
      company: "Acme",
      status: "active",
      mrr: 129.5,
      plan_name: "Plus",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-20T00:00:00.000Z",
      cancelled_at: null,
    }

    const events = buildCustomerActivityTimeline(customer)
    expect(events.map((event) => event.kind)).toContain("created")
    expect(events.some((event) => event.kind === "mrr")).toBe(true)
    expect(events.some((event) => event.kind === "status")).toBe(true)
    expect(events.some((event) => event.kind === "cancelled")).toBe(false)
    // Newest first
    expect(new Date(events[0]!.at).getTime()).toBeGreaterThanOrEqual(
      new Date(events[events.length - 1]!.at).getTime()
    )
  })

  it("builds created activity events for inserts", () => {
    const events = buildCreatedActivity({
      tenantId: "tenant",
      customerId: "cust",
      name: "Acme",
      planName: "Plus",
      status: "trial",
      mrr: 0,
    })
    expect(events.map((event) => event.kind)).toEqual([
      "created",
      "plan",
      "status",
    ])
  })
})

describe("relative time helper", () => {
  it("formats nearby timestamps", () => {
    const now = Date.parse("2026-07-25T12:00:00.000Z")
    expect(formatRelativeTime("2026-07-25T11:59:30.000Z", now)).toBe(
      "Just now"
    )
    expect(formatRelativeTime("2026-07-25T10:00:00.000Z", now)).toBe("2h ago")
    expect(formatRelativeTime("2026-07-24T12:00:00.000Z", now)).toBe(
      "Yesterday"
    )
  })
})

describe("metrics CSV serialize", () => {
  it("round-trips template rows", () => {
    const parsed = parseMetricsCsv(METRICS_CSV_TEMPLATE)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const csv = serializeMetricsCsv(parsed.rows)
    const again = parseMetricsCsv(csv)
    expect(again.ok).toBe(true)
    if (again.ok) {
      expect(again.rows).toEqual(parsed.rows)
    }
  })
})
