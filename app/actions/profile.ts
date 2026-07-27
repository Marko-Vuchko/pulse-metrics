"use server"

import { revalidatePath } from "next/cache"

import { mapAuthError, toUserSafeError } from "@/lib/actions/safe-error"
import { createClient } from "@/lib/supabase/server"
import {
  accountNameSchema,
  changePasswordSchema,
  settingsSchema,
  type AccountNameInput,
  type ChangePasswordInput,
  type ProfileActionResult,
  type SettingsInput,
} from "@/types/profile"

function companyOrNull(company: string): string | null {
  const trimmed = company.trim()
  return trimmed.length > 0 ? trimmed : null
}

function revalidateProfileViews() {
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/account")
}

export async function updateSettings(
  values: SettingsInput
): Promise<ProfileActionResult> {
  const parsed = settingsSchema.safeParse(values)

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
    return { error: "You must be signed in to update settings." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      company_name: companyOrNull(parsed.data.company_name),
      full_name: parsed.data.full_name,
    })
    .eq("id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update settings.") }
  }

  revalidateProfileViews()
  return { success: true }
}

export async function updateAccountName(
  values: AccountNameInput
): Promise<ProfileActionResult> {
  const parsed = accountNameSchema.safeParse(values)

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
    return { error: "You must be signed in to update your account." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id)

  if (error) {
    return { error: toUserSafeError(error, "Failed to update your account.") }
  }

  revalidateProfileViews()
  return { success: true }
}

export async function changePassword(
  values: ChangePasswordInput
): Promise<ProfileActionResult> {
  const parsed = changePasswordSchema.safeParse(values)

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
    return { error: "You must be signed in to change your password." }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  return { success: true }
}
