"use server"

import { revalidatePath } from "next/cache"

import {
  buildCreatedActivity,
  insertCustomerActivityEvents,
} from "@/lib/data/customer-activity"
import { insertNotifications } from "@/lib/data/notifications"
import {
  buildSampleCustomerRows,
  buildSampleMetricRows,
} from "@/lib/data/sample-data"
import { isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"

export type SampleDataResult =
  | { ok: true; customers: number; metrics: number }
  | { ok: false; error: string }

/**
 * Inserts seed-like customers + metric points for the signed-in tenant.
 * No-op (friendly error) if the tenant already has data.
 */
export async function loadSampleData(): Promise<SampleDataResult> {
  if (await isE2EMockSession()) {
    return { ok: false, error: "Sample data is unavailable in mock mode." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "You must be signed in to load sample data." }
  }

  const [
    { count: customerCount, error: customerCountError },
    { count: metricCount, error: metricCountError },
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", user.id),
    supabase
      .from("metric_points")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", user.id),
  ])

  if (customerCountError) {
    return { ok: false, error: customerCountError.message }
  }
  if (metricCountError) {
    return { ok: false, error: metricCountError.message }
  }

  if ((customerCount ?? 0) > 0 || (metricCount ?? 0) > 0) {
    return {
      ok: false,
      error:
        "Your workspace already has data. Sample load is only for empty accounts.",
    }
  }

  const customers = buildSampleCustomerRows(user.id)
  const metrics = buildSampleMetricRows(user.id)

  const { data: insertedCustomers, error: customersError } = await supabase
    .from("customers")
    .insert(customers)
    .select("id, name, status, mrr, plan_name")

  if (customersError) {
    return { ok: false, error: customersError.message }
  }

  const { error: metricsError } = await supabase
    .from("metric_points")
    .insert(metrics)

  if (metricsError) {
    await supabase.from("customers").delete().eq("tenant_id", user.id)
    return { ok: false, error: metricsError.message }
  }

  const activity = (insertedCustomers ?? []).flatMap((row) =>
    buildCreatedActivity({
      tenantId: user.id,
      customerId: row.id,
      name: row.name,
      planName: row.plan_name,
      status: row.status,
      mrr: Number(row.mrr),
    })
  )
  await insertCustomerActivityEvents(supabase, activity)

  await insertNotifications(supabase, [
    {
      tenant_id: user.id,
      title: "Sample workspace loaded",
      description: `${customers.length} customers and ${metrics.length} metric days are ready to explore.`,
      severity: "success",
      href: "/dashboard",
    },
    {
      tenant_id: user.id,
      title: "Next: explore analytics",
      description: "Open Analytics to review MRR, churn, and active users.",
      severity: "info",
      href: "/dashboard/analytics",
    },
  ])

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/analytics")
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/metrics")
  revalidatePath("/dashboard", "layout")

  return {
    ok: true,
    customers: customers.length,
    metrics: metrics.length,
  }
}
