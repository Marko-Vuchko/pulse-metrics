import { z } from "zod"

import type { Database } from "@/types/database"

export const teamMemberRoleSchema = z.enum(["admin", "member", "viewer"])

export type TeamMemberRole = z.infer<typeof teamMemberRoleSchema>

export const TEAM_MEMBER_ROLES = teamMemberRoleSchema.options

export const TEAM_MEMBER_ROLE_LABELS: Record<TeamMemberRole, string> = {
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
}

export const teamInviteStatusSchema = z.enum([
  "pending",
  "accepted",
  "revoked",
])

export type TeamInviteStatus = z.infer<typeof teamInviteStatusSchema>

export const TEAM_INVITE_STATUS_LABELS: Record<TeamInviteStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  revoked: "Revoked",
}

export type TeamInviteRow = {
  id: string
  tenant_id: string
  email: string
  role: TeamMemberRole
  status: TeamInviteStatus
  invited_by: string
  created_at: string
  updated_at: string
}

export const createTeamInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(254, "Email is too long"),
  role: teamMemberRoleSchema,
})

export type CreateTeamInviteInput = z.infer<typeof createTeamInviteSchema>

export const revokeTeamInviteSchema = z.object({
  id: z.string().uuid("Invalid invite"),
})

export type RevokeTeamInviteInput = z.infer<typeof revokeTeamInviteSchema>

export const acceptTeamInviteSchema = z.object({
  id: z.string().uuid("Invalid invite"),
})

export type AcceptTeamInviteInput = z.infer<typeof acceptTeamInviteSchema>

export type TeamActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Partial<Record<string, string[]>>
}

export type TeamWorkspace = {
  ownerEmail: string
  ownerName: string | null
  companyName: string | null
  invites: TeamInviteRow[]
}

/** Compile-time guard that invite rows match generated DB types. */
export type TeamInviteDbRow = Database["public"]["Tables"]["team_invites"]["Row"]
