import { createClient } from "@/lib/supabase/server"
import type { ProfileRow } from "@/types/profile"

/**
 * Profile for the authenticated user (user-as-tenant).
 * Returns null when unauthenticated or the profile row is missing.
 */
export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, company_name, avatar_url, billing_plan, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data as ProfileRow
}
