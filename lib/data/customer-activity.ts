import type { SupabaseClient } from "@supabase/supabase-js"

import { reportError } from "@/lib/observability/report-error"
import type {
  CustomerActivityEvent,
  CustomerActivityKind,
  CustomerDetail,
} from "@/types/customers"
import type { Database } from "@/types/database"

type DbClient = SupabaseClient<Database>

type ActivityInsert = {
  tenant_id: string
  customer_id: string
  kind: CustomerActivityKind
  title: string
  description: string
  created_at?: string
}

function addUtcDays(iso: string, days: number): string {
  const date = new Date(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function addUtcHours(iso: string, hours: number): string {
  const date = new Date(iso)
  date.setUTCHours(date.getUTCHours() + hours)
  return date.toISOString()
}

/**
 * Deterministic fallback timeline derived from customer fields.
 * Used when a customer has no rows in customer_activity_events yet.
 */
export function buildCustomerActivityTimeline(
  customer: CustomerDetail
): CustomerActivityEvent[] {
  const events: CustomerActivityEvent[] = [
    {
      id: `${customer.id}-created`,
      kind: "created",
      title: "Customer created",
      description: `${customer.name} added to the roster.`,
      at: customer.created_at,
    },
    {
      id: `${customer.id}-plan`,
      kind: "plan",
      title: `Plan set to ${customer.plan_name}`,
      description: `Subscribed on the ${customer.plan_name} tier.`,
      at: addUtcHours(customer.created_at, 2),
    },
  ]

  if (customer.status === "trial") {
    events.push({
      id: `${customer.id}-trial`,
      kind: "status",
      title: "Trial started",
      description: "Customer entered a trial window.",
      at: addUtcDays(customer.created_at, 1),
    })
  }

  if (customer.status === "active" || customer.status === "cancelled") {
    events.push({
      id: `${customer.id}-activated`,
      kind: "status",
      title: "Marked active",
      description: "Trial converted or status set to active.",
      at: addUtcDays(customer.created_at, 14),
    })
  }

  if (Number(customer.mrr) > 0) {
    events.push({
      id: `${customer.id}-mrr`,
      kind: "mrr",
      title: "MRR recorded",
      description: `Monthly recurring revenue set to €${Number(customer.mrr).toFixed(2)}.`,
      at: addUtcDays(customer.created_at, 15),
    })
  }

  events.push({
    id: `${customer.id}-note`,
    kind: "note",
    title: "Account note",
    description: "Touchpoint logged from portfolio demo activity.",
    at: addUtcDays(customer.created_at, 21),
  })

  if (customer.cancelled_at) {
    events.push({
      id: `${customer.id}-cancelled`,
      kind: "cancelled",
      title: "Subscription cancelled",
      description: "Customer moved to cancelled status.",
      at: customer.cancelled_at,
    })
  } else if (customer.status === "cancelled") {
    events.push({
      id: `${customer.id}-cancelled-fallback`,
      kind: "cancelled",
      title: "Subscription cancelled",
      description: "Customer moved to cancelled status.",
      at: customer.updated_at,
    })
  }

  if (customer.status === "archived") {
    events.push({
      id: `${customer.id}-archived`,
      kind: "status",
      title: "Archived",
      description: "Customer soft-archived from the active roster.",
      at: customer.updated_at,
    })
  }

  if (
    customer.updated_at &&
    customer.updated_at !== customer.created_at &&
    !events.some((event) => event.at === customer.updated_at)
  ) {
    events.push({
      id: `${customer.id}-updated`,
      kind: "note",
      title: "Profile updated",
      description: "Customer fields were last saved.",
      at: customer.updated_at,
    })
  }

  return events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  )
}

export async function insertCustomerActivityEvents(
  supabase: DbClient,
  events: ActivityInsert[]
): Promise<void> {
  if (events.length === 0) return

  const { error } = await supabase.from("customer_activity_events").insert(events)

  if (error) {
    reportError(error)
  }
}

export async function listCustomerActivityEvents(
  supabase: DbClient,
  options: { tenantId: string; customerId: string }
): Promise<CustomerActivityEvent[]> {
  const { data, error } = await supabase
    .from("customer_activity_events")
    .select("id, kind, title, description, created_at")
    .eq("tenant_id", options.tenantId)
    .eq("customer_id", options.customerId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load activity: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    at: row.created_at,
  }))
}

/**
 * Prefer DB activity rows; fall back to the synthesized timeline for legacy
 * customers created before activity writes shipped.
 */
export async function getCustomerActivityTimeline(
  supabase: DbClient,
  options: { tenantId: string; customer: CustomerDetail }
): Promise<CustomerActivityEvent[]> {
  const stored = await listCustomerActivityEvents(supabase, {
    tenantId: options.tenantId,
    customerId: options.customer.id,
  })

  if (stored.length > 0) {
    return stored
  }

  return buildCustomerActivityTimeline(options.customer)
}

export function buildCreatedActivity(options: {
  tenantId: string
  customerId: string
  name: string
  planName: string
  status: string
  mrr: number
}): ActivityInsert[] {
  const events: ActivityInsert[] = [
    {
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "created",
      title: "Customer created",
      description: `${options.name} added to the roster.`,
    },
    {
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "plan",
      title: `Plan set to ${options.planName}`,
      description: `Subscribed on the ${options.planName} tier.`,
    },
  ]

  if (options.status === "trial") {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "status",
      title: "Trial started",
      description: "Customer entered a trial window.",
    })
  } else if (options.status === "active") {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "status",
      title: "Marked active",
      description: "Customer status set to active.",
    })
  } else if (options.status === "cancelled") {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "cancelled",
      title: "Subscription cancelled",
      description: "Customer created as cancelled.",
    })
  }

  if (options.mrr > 0) {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "mrr",
      title: "MRR recorded",
      description: `Monthly recurring revenue set to €${options.mrr.toFixed(2)}.`,
    })
  }

  return events
}

type MutableCustomerSnapshot = {
  name: string
  status: string
  mrr: number
  plan_name: string
}

export function buildUpdateActivityDiff(options: {
  tenantId: string
  customerId: string
  before: MutableCustomerSnapshot
  after: MutableCustomerSnapshot
}): ActivityInsert[] {
  const events: ActivityInsert[] = []

  if (options.before.plan_name !== options.after.plan_name) {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "plan",
      title: `Plan changed to ${options.after.plan_name}`,
      description: `Moved from ${options.before.plan_name} to ${options.after.plan_name}.`,
    })
  }

  if (options.before.status !== options.after.status) {
    if (options.after.status === "cancelled") {
      events.push({
        tenant_id: options.tenantId,
        customer_id: options.customerId,
        kind: "cancelled",
        title: "Subscription cancelled",
        description: "Customer moved to cancelled status.",
      })
    } else if (options.after.status === "archived") {
      events.push({
        tenant_id: options.tenantId,
        customer_id: options.customerId,
        kind: "status",
        title: "Archived",
        description: "Customer soft-archived from the active roster.",
      })
    } else {
      events.push({
        tenant_id: options.tenantId,
        customer_id: options.customerId,
        kind: "status",
        title: `Status set to ${options.after.status}`,
        description: `Changed from ${options.before.status} to ${options.after.status}.`,
      })
    }
  }

  if (Number(options.before.mrr) !== Number(options.after.mrr)) {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "mrr",
      title: "MRR updated",
      description: `Monthly recurring revenue set to €${Number(options.after.mrr).toFixed(2)}.`,
    })
  }

  if (
    options.before.name !== options.after.name &&
    events.length === 0
  ) {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "note",
      title: "Profile updated",
      description: `Name changed to ${options.after.name}.`,
    })
  } else if (events.length === 0) {
    events.push({
      tenant_id: options.tenantId,
      customer_id: options.customerId,
      kind: "note",
      title: "Profile updated",
      description: "Customer fields were saved.",
    })
  }

  return events
}
