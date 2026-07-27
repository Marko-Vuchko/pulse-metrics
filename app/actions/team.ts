"use server"

import { revalidatePath } from "next/cache"

import { toUserSafeError } from "@/lib/actions/safe-error"
import { isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"
import {
  acceptTeamInviteSchema,
  createTeamInviteSchema,
  revokeTeamInviteSchema,
  type AcceptTeamInviteInput,
  type CreateTeamInviteInput,
  type RevokeTeamInviteInput,
  type TeamActionResult,
} from "@/types/team"

function revalidateTeam() {
  revalidatePath("/dashboard/team")
}

export async function createTeamInvite(
  values: CreateTeamInviteInput
): Promise<TeamActionResult> {
  const parsed = createTeamInviteSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  if (await isE2EMockSession()) {
    revalidateTeam()
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to invite teammates." }
  }

  const email = parsed.data.email.trim().toLowerCase()

  if (user.email && email === user.email.toLowerCase()) {
    return { error: "You cannot invite yourself." }
  }

  const { error } = await supabase.from("team_invites").insert({
    tenant_id: user.id,
    invited_by: user.id,
    email,
    role: parsed.data.role,
    status: "pending",
  })

  if (error) {
    if (error.code === "23505") {
      return { error: "A pending invite already exists for that email." }
    }
    return { error: toUserSafeError(error, "Failed to create invite.") }
  }

  revalidateTeam()
  return { success: true }
}

export async function revokeTeamInvite(
  values: RevokeTeamInviteInput
): Promise<TeamActionResult> {
  const parsed = revokeTeamInviteSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid invite." }
  }

  if (await isE2EMockSession()) {
    revalidateTeam()
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to revoke invites." }
  }

  const { error } = await supabase
    .from("team_invites")
    .update({ status: "revoked" })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .eq("status", "pending")

  if (error) {
    return { error: toUserSafeError(error, "Failed to revoke invite.") }
  }

  revalidateTeam()
  return { success: true }
}

/** Demo-only accept - marks invite accepted without changing tenancy RLS. */
export async function acceptTeamInviteDemo(
  values: AcceptTeamInviteInput
): Promise<TeamActionResult> {
  const parsed = acceptTeamInviteSchema.safeParse(values)

  if (!parsed.success) {
    return { error: "Invalid invite." }
  }

  if (await isE2EMockSession()) {
    revalidateTeam()
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be signed in to update invites." }
  }

  const { error } = await supabase
    .from("team_invites")
    .update({ status: "accepted" })
    .eq("id", parsed.data.id)
    .eq("tenant_id", user.id)
    .eq("status", "pending")

  if (error) {
    return { error: toUserSafeError(error, "Failed to update invite.") }
  }

  revalidateTeam()
  return { success: true }
}
