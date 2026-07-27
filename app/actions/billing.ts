"use server"

import { revalidatePath } from "next/cache"

import { toUserSafeError } from "@/lib/actions/safe-error"
import { isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"
import {
  checkoutSchema,
  type BillingActionResult,
  type CheckoutInput,
} from "@/types/billing"
import type { PlanName } from "@/types/customers"

export async function updateBillingPlan(
  values: CheckoutInput
): Promise<BillingActionResult> {
  const parsed = checkoutSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  if (await isE2EMockSession()) {
    revalidatePath("/dashboard/billing")
    return { success: true, plan: parsed.data.plan }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update billing." }
  }

  const plan = parsed.data.plan as PlanName

  const { error } = await supabase
    .from("profiles")
    .update({ billing_plan: plan })
    .eq("id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update billing plan.") }
  }

  revalidatePath("/dashboard/billing")
  revalidatePath("/dashboard", "layout")
  return { success: true, plan }
}
