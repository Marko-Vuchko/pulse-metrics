import type { SupabaseClient } from "@supabase/supabase-js"

import { isE2EMockSession } from "@/lib/e2e/mock"
import { reportError } from "@/lib/observability/report-error"
import { createClient } from "@/lib/supabase/server"
import { formatRelativeTime } from "@/lib/utils"
import type { Database } from "@/types/database"
import type {
  NotificationAlert,
  NotificationSeverity,
} from "@/types/notifications"

type DbClient = SupabaseClient<Database>

type NotificationInsert = {
  tenant_id: string
  title: string
  description: string
  severity?: NotificationSeverity
  href?: string
  created_at?: string
}

/** Deterministic alerts for Playwright mock-auth sessions. */
export function getMockNotifications(): NotificationAlert[] {
  return [
    {
      id: "mock-churn-up",
      title: "Churn up 2%",
      description: "7-day churn rose vs the prior window. Review at-risk accounts.",
      severity: "warning",
      href: "/dashboard/analytics",
      timeLabel: "2h ago",
      unread: true,
    },
    {
      id: "mock-mrr-up",
      title: "MRR up 4.1%",
      description: "Monthly recurring revenue climbed over the last 7 days.",
      severity: "success",
      href: "/dashboard",
      timeLabel: "5h ago",
      unread: true,
    },
    {
      id: "mock-new-signup",
      title: "New customer created",
      description: "A new account landed on the Basic plan.",
      severity: "info",
      href: "/dashboard/customers",
      timeLabel: "Yesterday",
      unread: false,
    },
  ]
}

export async function insertNotifications(
  supabase: DbClient,
  rows: NotificationInsert[]
): Promise<void> {
  if (rows.length === 0) return

  const { error } = await supabase.from("notifications").insert(
    rows.map((row) => ({
      tenant_id: row.tenant_id,
      title: row.title,
      description: row.description,
      severity: row.severity ?? "info",
      href: row.href ?? "/dashboard",
      // Omit undefined so Postgres default (now()) applies - explicit null fails NOT NULL.
      ...(row.created_at ? { created_at: row.created_at } : {}),
    }))
  )

  if (error) {
    reportError(error)
  }
}

export async function listNotifications(
  limit = 20
): Promise<NotificationAlert[]> {
  if (await isE2EMockSession()) {
    return getMockNotifications()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, description, severity, href, read_at, created_at")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    reportError(error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    href: row.href,
    timeLabel: formatRelativeTime(row.created_at),
    unread: row.read_at == null,
  }))
}

export async function markNotificationsRead(options: {
  ids?: string[]
  all?: boolean
}): Promise<{ error?: string; success?: boolean }> {
  if (await isE2EMockSession()) {
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update notifications." }
  }

  const readAt = new Date().toISOString()
  let query = supabase
    .from("notifications")
    .update({ read_at: readAt })
    .eq("tenant_id", user.id)
    .is("read_at", null)

  if (options.all) {
    // mark every unread row for the tenant
  } else if (options.ids && options.ids.length > 0) {
    query = query.in("id", options.ids)
  } else {
    return { error: "No notifications selected." }
  }

  const { error } = await query

  if (error) {
    reportError(error)
    return { error: "Could not update notifications." }
  }

  return { success: true }
}
