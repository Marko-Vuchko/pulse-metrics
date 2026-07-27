import { isE2EMockSession } from "@/lib/e2e/mock"
import { createClient } from "@/lib/supabase/server"
import type { TeamInviteRow, TeamWorkspace } from "@/types/team"

const MOCK_WORKSPACE: TeamWorkspace = {
  ownerEmail: "demo@fluxislabs.com",
  ownerName: "Demo User",
  companyName: "Fluxis Labs",
  invites: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      tenant_id: "e2e-mock",
      email: "alex@example.com",
      role: "member",
      status: "pending",
      invited_by: "e2e-mock",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
}

export async function getTeamWorkspace(): Promise<TeamWorkspace | null> {
  if (await isE2EMockSession()) {
    return MOCK_WORKSPACE
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [{ data: profile }, { data: invites, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, full_name, company_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("team_invites")
      .select(
        "id, tenant_id, email, role, status, invited_by, created_at, updated_at"
      )
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  if (error) {
    throw new Error(`Failed to load team invites: ${error.message}`)
  }

  return {
    ownerEmail: profile?.email ?? user.email ?? "",
    ownerName: profile?.full_name ?? null,
    companyName: profile?.company_name ?? null,
    invites: (invites ?? []) as TeamInviteRow[],
  }
}
