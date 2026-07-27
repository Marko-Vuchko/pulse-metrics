/** Compact demo dataset for new signups (mirrors seed.sql shape, smaller). */

export type SampleCustomer = {
  name: string
  email: string
  company: string
  status: "active" | "trial" | "cancelled"
  mrr: number
  plan_name: "Basic" | "Plus" | "Premium"
  created_offset_days: number
  /** Days ago cancelled_at is set; only for cancelled status. */
  cancelled_offset_days?: number
}

export const SAMPLE_CUSTOMERS: SampleCustomer[] = [
  {
    name: "Acme Robotics",
    email: "ops@acmerobotics.io",
    company: "Acme Robotics",
    status: "active",
    mrr: 890,
    plan_name: "Premium",
    created_offset_days: 118,
  },
  {
    name: "Northwind Analytics",
    email: "billing@northwind.example",
    company: "Northwind Analytics",
    status: "active",
    mrr: 420,
    plan_name: "Plus",
    created_offset_days: 110,
  },
  {
    name: "Cedar Systems",
    email: "hello@cedarsystems.dev",
    company: "Cedar Systems",
    status: "active",
    mrr: 149,
    plan_name: "Basic",
    created_offset_days: 95,
  },
  {
    name: "Orbit Freight",
    email: "accounts@orbitfreight.com",
    company: "Orbit Freight",
    status: "active",
    mrr: 640,
    plan_name: "Premium",
    created_offset_days: 88,
  },
  {
    name: "Harbor CRM",
    email: "admin@harborcrm.app",
    company: "Harbor CRM",
    status: "active",
    mrr: 520,
    plan_name: "Plus",
    created_offset_days: 74,
  },
  {
    name: "Quiet Labs",
    email: "hi@quietlabs.dev",
    company: "Quiet Labs",
    status: "active",
    mrr: 129,
    plan_name: "Basic",
    created_offset_days: 28,
  },
  {
    name: "Trailhead Apps",
    email: "trial@trailhead.apps",
    company: "Trailhead Apps",
    status: "trial",
    mrr: 0,
    plan_name: "Basic",
    created_offset_days: 21,
  },
  {
    name: "Bluepine AI",
    email: "hello@bluepine.ai",
    company: "Bluepine AI",
    status: "trial",
    mrr: 0,
    plan_name: "Premium",
    created_offset_days: 11,
  },
  {
    name: "Former Cloud",
    email: "bye@formercloud.io",
    company: "Former Cloud",
    status: "cancelled",
    mrr: 0,
    plan_name: "Plus",
    created_offset_days: 130,
    cancelled_offset_days: 40,
  },
]

const SAMPLE_METRIC_DAYS = 90

function utcDateOffset(daysAgo: number): string {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

function isoDaysAgo(daysAgo: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString()
}

export function buildSampleCustomerRows(tenantId: string) {
  return SAMPLE_CUSTOMERS.map((customer) => ({
    tenant_id: tenantId,
    name: customer.name,
    email: customer.email,
    company: customer.company,
    status: customer.status,
    mrr: customer.mrr,
    plan_name: customer.plan_name,
    cancelled_at:
      customer.status === "cancelled"
        ? isoDaysAgo(customer.cancelled_offset_days ?? 40)
        : null,
    created_at: isoDaysAgo(customer.created_offset_days),
  }))
}

export function buildSampleMetricRows(tenantId: string) {
  const rows: Array<{
    tenant_id: string
    date: string
    mrr: number
    active_users: number
    churn_rate: number
    arpu: number
  }> = []

  for (let i = 0; i < SAMPLE_METRIC_DAYS; i += 1) {
    const daysAgo = SAMPLE_METRIC_DAYS - 1 - i
    const mrr = Math.round((6200 + i * 28 + Math.sin(i / 7) * 120) * 100) / 100
    const activeUsers = Math.round(840 + i * 3 + (i % 5) * 2)
    const churnRate =
      Math.round((0.028 - i * 0.00008 + Math.sin(i / 11) * 0.004) * 10000) /
      10000
    const arpu = Math.round((mrr / Math.max(activeUsers, 1)) * 100) / 100

    rows.push({
      tenant_id: tenantId,
      date: utcDateOffset(daysAgo),
      mrr,
      active_users: activeUsers,
      churn_rate: churnRate,
      arpu,
    })
  }

  return rows
}
