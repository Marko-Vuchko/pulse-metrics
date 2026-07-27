"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { toUserSafeError } from "@/lib/actions/safe-error"
import {
  buildCreatedActivity,
  buildUpdateActivityDiff,
  insertCustomerActivityEvents,
} from "@/lib/data/customer-activity"
import { listCustomersForExport } from "@/lib/data/customers"
import { insertNotifications } from "@/lib/data/notifications"
import { createClient } from "@/lib/supabase/server"
import {
  archiveCustomerSchema,
  bulkCustomerStatusSchema,
  createCustomerSchema,
  updateCustomerSchema,
  type ArchiveCustomerInput,
  type BulkCustomerStatusInput,
  type CreateCustomerInput,
  type CustomerActionResult,
  type CustomerMutableStatus,
  type CustomerStatusFilter,
  type CustomerSort,
  type CustomerSortDir,
  type UpdateCustomerInput,
  customerMutableStatusSchema,
} from "@/types/customers"
import { z } from "zod"

function cancelledAtForStatus(status: CustomerMutableStatus): string | null {
  return status === "cancelled" ? new Date().toISOString() : null
}

function companyOrNull(company: string): string | null {
  const trimmed = company.trim()
  return trimmed.length > 0 ? trimmed : null
}

type MutationOptions = {
  /** When false, revalidate only (for optimistic UI / undo toast). Default true. */
  navigate?: boolean
}

function finishMutation(
  returnPath: string,
  options?: MutationOptions
): CustomerActionResult | never {
  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard", "layout")
  if (returnPath && returnPath !== "/dashboard/customers") {
    revalidatePath(returnPath)
  }
  if (options?.navigate === false) {
    return { success: true }
  }
  redirect(returnPath || "/dashboard/customers")
}

export async function createCustomer(
  values: CreateCustomerInput,
  returnPath: string
): Promise<CustomerActionResult | void> {
  const parsed = createCustomerSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to create a customer." }
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      tenant_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      company: companyOrNull(parsed.data.company),
      status: parsed.data.status,
      mrr: parsed.data.mrr,
      plan_name: parsed.data.plan_name,
      cancelled_at: cancelledAtForStatus(parsed.data.status),
    })
    .select("id")
    .single()

  if (error || !data) {
    return {
      error: toUserSafeError(error ?? new Error("empty insert"), "Failed to create customer."),
    }
  }

  await insertCustomerActivityEvents(
    supabase,
    buildCreatedActivity({
      tenantId: user.id,
      customerId: data.id,
      name: parsed.data.name,
      planName: parsed.data.plan_name,
      status: parsed.data.status,
      mrr: parsed.data.mrr,
    })
  )

  await insertNotifications(supabase, [
    {
      tenant_id: user.id,
      title: "New customer created",
      description: `${parsed.data.name} landed on the ${parsed.data.plan_name} plan.`,
      severity: "info",
      href: `/dashboard/customers/${data.id}`,
    },
  ])

  finishMutation(returnPath)
}

export async function updateCustomer(
  values: UpdateCustomerInput,
  returnPath: string
): Promise<CustomerActionResult | void> {
  const parsed = updateCustomerSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update a customer." }
  }

  const { data: before, error: beforeError } = await supabase
    .from("customers")
    .select("name, status, mrr, plan_name")
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .maybeSingle()

  if (beforeError) {
    return { error: toUserSafeError(beforeError, "Failed to load customer.") }
  }
  if (!before) {
    return { error: "Customer not found." }
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      company: companyOrNull(parsed.data.company),
      status: parsed.data.status,
      mrr: parsed.data.mrr,
      plan_name: parsed.data.plan_name,
      cancelled_at: cancelledAtForStatus(parsed.data.status),
    })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update customer.") }
  }

  await insertCustomerActivityEvents(
    supabase,
    buildUpdateActivityDiff({
      tenantId: user.id,
      customerId: parsed.data.id,
      before,
      after: {
        name: parsed.data.name,
        status: parsed.data.status,
        mrr: parsed.data.mrr,
        plan_name: parsed.data.plan_name,
      },
    })
  )

  finishMutation(returnPath)
}

const updateCustomerStatusSchema = z.object({
  id: z.string().uuid("Invalid customer"),
  status: customerMutableStatusSchema,
})

export async function updateCustomerStatus(
  values: { id: string; status: CustomerMutableStatus },
  returnPath: string,
  options?: MutationOptions
): Promise<CustomerActionResult | void> {
  const parsed = updateCustomerStatusSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid status update." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update a customer." }
  }

  const { data: before, error: beforeError } = await supabase
    .from("customers")
    .select("name, status, mrr, plan_name")
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .maybeSingle()

  if (beforeError) {
    return { error: toUserSafeError(beforeError, "Failed to load customer.") }
  }
  if (!before) {
    return { error: "Customer not found." }
  }

  const { error } = await supabase
    .from("customers")
    .update({
      status: parsed.data.status,
      cancelled_at: cancelledAtForStatus(parsed.data.status),
    })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update customer.") }
  }

  await insertCustomerActivityEvents(
    supabase,
    buildUpdateActivityDiff({
      tenantId: user.id,
      customerId: parsed.data.id,
      before,
      after: {
        name: before.name,
        status: parsed.data.status,
        mrr: before.mrr,
        plan_name: before.plan_name,
      },
    })
  )

  return finishMutation(returnPath, options)
}

export async function archiveCustomer(
  values: ArchiveCustomerInput,
  returnPath: string,
  options?: MutationOptions
): Promise<CustomerActionResult | void> {
  const parsed = archiveCustomerSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid customer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to delete a customer." }
  }

  const { data: before, error: beforeError } = await supabase
    .from("customers")
    .select("name, status, mrr, plan_name")
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .maybeSingle()

  if (beforeError) {
    return { error: toUserSafeError(beforeError, "Failed to load customer.") }
  }
  if (!before) {
    return { error: "Customer not found." }
  }

  const { error } = await supabase
    .from("customers")
    .update({ status: "archived" })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to archive customer.") }
  }

  await insertCustomerActivityEvents(
    supabase,
    buildUpdateActivityDiff({
      tenantId: user.id,
      customerId: parsed.data.id,
      before,
      after: {
        name: before.name,
        status: "archived",
        mrr: before.mrr,
        plan_name: before.plan_name,
      },
    })
  )

  return finishMutation(returnPath, { navigate: options?.navigate ?? false })
}

export async function restoreCustomer(
  values: ArchiveCustomerInput
): Promise<CustomerActionResult> {
  const parsed = archiveCustomerSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid customer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to restore a customer." }
  }

  const { data: before, error: beforeError } = await supabase
    .from("customers")
    .select("name, status, mrr, plan_name")
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .maybeSingle()

  if (beforeError) {
    return { error: toUserSafeError(beforeError, "Failed to load customer.") }
  }
  if (!before) {
    return { error: "Customer not found." }
  }

  const { error } = await supabase
    .from("customers")
    .update({ status: "active", cancelled_at: null })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to restore customer.") }
  }

  await insertCustomerActivityEvents(
    supabase,
    buildUpdateActivityDiff({
      tenantId: user.id,
      customerId: parsed.data.id,
      before,
      after: {
        name: before.name,
        status: "active",
        mrr: before.mrr,
        plan_name: before.plan_name,
      },
    })
  )

  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard", "layout")
  return { success: true }
}

export async function bulkUpdateCustomerStatus(
  values: BulkCustomerStatusInput,
  returnPath: string,
  options?: MutationOptions
): Promise<CustomerActionResult | void> {
  const parsed = bulkCustomerStatusSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid bulk update.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update customers." }
  }

  const { data: beforeRows, error: beforeError } = await supabase
    .from("customers")
    .select("id, name, status, mrr, plan_name")
    .eq("tenant_id", user.id)
    .in("id", parsed.data.ids)

  if (beforeError) {
    return { error: toUserSafeError(beforeError, "Failed to load customers.") }
  }

  const { error } = await supabase
    .from("customers")
    .update({
      status: parsed.data.status,
      cancelled_at: cancelledAtForStatus(parsed.data.status),
    })
    .eq("tenant_id", user.id)
    .in("id", parsed.data.ids)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update customers.") }
  }

  const activity = (beforeRows ?? []).flatMap((row) =>
    buildUpdateActivityDiff({
      tenantId: user.id,
      customerId: row.id,
      before: row,
      after: {
        name: row.name,
        status: parsed.data.status,
        mrr: row.mrr,
        plan_name: row.plan_name,
      },
    })
  )
  await insertCustomerActivityEvents(supabase, activity)

  await insertNotifications(supabase, [
    {
      tenant_id: user.id,
      title: "Bulk status update",
      description: `${parsed.data.ids.length} customer(s) set to ${parsed.data.status}.`,
      severity: "info",
      href: "/dashboard/customers",
    },
  ])

  return finishMutation(returnPath, { navigate: options?.navigate ?? false })
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function exportCustomersCsv(options: {
  q?: string
  status?: CustomerStatusFilter
  sort?: CustomerSort
  dir?: CustomerSortDir
}): Promise<{ error?: string; csv?: string; filename?: string }> {
  try {
    const rows = await listCustomersForExport(options)
    const header = [
      "name",
      "email",
      "company",
      "status",
      "mrr",
      "plan_name",
      "created_at",
    ]
    const lines = [
      header.join(","),
      ...rows.map((row) =>
        [
          csvEscape(row.name),
          csvEscape(row.email),
          csvEscape(row.company ?? ""),
          csvEscape(row.status),
          csvEscape(String(row.mrr)),
          csvEscape(row.plan_name),
          csvEscape(row.created_at),
        ].join(",")
      ),
    ]
    const stamp = new Date().toISOString().slice(0, 10)
    return {
      csv: lines.join("\n"),
      filename: `pulsemetrics-customers-${stamp}.csv`,
    }
  } catch (error) {
    return {
      error: toUserSafeError(error, "Failed to export customers."),
    }
  }
}
