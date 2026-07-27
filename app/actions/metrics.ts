"use server"

import { revalidatePath } from "next/cache"

import { toUserSafeError } from "@/lib/actions/safe-error"
import { insertNotifications } from "@/lib/data/notifications"
import { isE2EMockSession } from "@/lib/e2e/mock"
import { serializeMetricsCsv } from "@/lib/metrics/csv"
import { createClient } from "@/lib/supabase/server"
import {
  metricPointWriteSchema,
  metricPointsBulkWriteSchema,
  type MetricPointWriteInput,
  type MetricPointsBulkWriteInput,
  type MetricsWriteActionResult,
} from "@/types/metrics"

function revalidateMetricsViews() {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/analytics")
  revalidatePath("/dashboard/metrics")
  revalidatePath("/dashboard", "layout")
}

export async function upsertMetricPoint(
  values: MetricPointWriteInput
): Promise<MetricsWriteActionResult> {
  const parsed = metricPointWriteSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  if (await isE2EMockSession()) {
    revalidateMetricsViews()
    return { success: true, upserted: 1 }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to save metrics." }
  }

  const row = {
    tenant_id: user.id,
    date: parsed.data.date,
    mrr: parsed.data.mrr,
    active_users: parsed.data.active_users,
    churn_rate: parsed.data.churn_rate,
    arpu: parsed.data.arpu,
  }

  const { error } = await supabase.from("metric_points").upsert(row, {
    onConflict: "tenant_id,date",
  })

  if (error) {
    return { error: toUserSafeError(error, "Failed to save metrics.") }
  }

  await insertNotifications(supabase, [
    {
      tenant_id: user.id,
      title: "Metrics point saved",
      description: `Updated KPIs for ${parsed.data.date}.`,
      severity: "success",
      href: "/dashboard/metrics",
    },
  ])

  revalidateMetricsViews()
  return { success: true, upserted: 1 }
}

export async function upsertMetricPointsBulk(
  values: MetricPointsBulkWriteInput
): Promise<MetricsWriteActionResult> {
  const parsed = metricPointsBulkWriteSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid CSV rows." }
  }

  // Deduplicate by date (last write wins) so unique constraint upsert is stable.
  const byDate = new Map<string, MetricPointWriteInput>()
  for (const row of parsed.data) {
    byDate.set(row.date, row)
  }
  const uniqueRows = [...byDate.values()]

  if (await isE2EMockSession()) {
    revalidateMetricsViews()
    return { success: true, upserted: uniqueRows.length }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to import metrics." }
  }

  const payload = uniqueRows.map((row) => ({
    tenant_id: user.id,
    date: row.date,
    mrr: row.mrr,
    active_users: row.active_users,
    churn_rate: row.churn_rate,
    arpu: row.arpu,
  }))

  const { error } = await supabase.from("metric_points").upsert(payload, {
    onConflict: "tenant_id,date",
  })

  if (error) {
    return { error: toUserSafeError(error, "Failed to import metrics.") }
  }

  await insertNotifications(supabase, [
    {
      tenant_id: user.id,
      title: "Metrics CSV imported",
      description: `Upserted ${payload.length} metric day(s) into your workspace.`,
      severity: "success",
      href: "/dashboard/metrics",
    },
  ])

  revalidateMetricsViews()
  return { success: true, upserted: payload.length }
}

export async function exportMetricsCsv(): Promise<{
  error?: string
  csv?: string
  filename?: string
}> {
  if (await isE2EMockSession()) {
    const stamp = new Date().toISOString().slice(0, 10)
    return {
      csv: serializeMetricsCsv([
        {
          date: stamp,
          mrr: 12450,
          active_users: 812,
          churn_rate: 0.024,
          arpu: 42.1,
        },
      ]),
      filename: `pulsemetrics-metrics-${stamp}.csv`,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to export metrics." }
  }

  const { data, error } = await supabase
    .from("metric_points")
    .select("date, mrr, active_users, churn_rate, arpu")
    .eq("tenant_id", user.id)
    .order("date", { ascending: true })

  if (error) {
    return { error: toUserSafeError(error, "Failed to export metrics.") }
  }

  const rows = data ?? []
  if (rows.length === 0) {
    return { error: "No metric points to export yet." }
  }

  const stamp = new Date().toISOString().slice(0, 10)
  return {
    csv: serializeMetricsCsv(rows),
    filename: `pulsemetrics-metrics-${stamp}.csv`,
  }
}
