"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { mapAuthError } from "@/lib/actions/safe-error"
import { getClientIp } from "@/lib/security/client-ip"
import {
  checkRateLimit,
  rateLimitKey,
} from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  type AuthActionResult,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignUpInput,
} from "@/types/auth"

const AUTH_WINDOW_MS = 15 * 60 * 1000

async function enforceAuthRateLimit(
  action: string,
  limit: number
): Promise<AuthActionResult | null> {
  const ip = await getClientIp()
  const result = checkRateLimit(rateLimitKey(action, ip), {
    limit,
    windowMs: AUTH_WINDOW_MS,
  })

  if (!result.ok) {
    return {
      error: `Too many attempts. Try again in about ${result.retryAfterSec}s.`,
    }
  }

  return null
}

export async function signIn(
  values: LoginInput
): Promise<AuthActionResult | void> {
  const limited = await enforceAuthRateLimit("auth.signIn", 10)
  if (limited) return limited

  const parsed = loginSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  redirect("/dashboard")
}

export async function signUp(
  values: SignUpInput
): Promise<AuthActionResult | void> {
  const limited = await enforceAuthRateLimit("auth.signUp", 5)
  if (limited) return limited

  const parsed = signUpSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/login`,
    },
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  redirect(
    `/signup/check-email?email=${encodeURIComponent(parsed.data.email)}`
  )
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function signInWithGoogle(): Promise<
  AuthActionResult & { url?: string }
> {
  const limited = await enforceAuthRateLimit("auth.google", 10)
  if (limited) return limited

  const headerStore = await headers()
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  if (!data.url) {
    return { error: "Google sign-in is not available right now." }
  }

  return { url: data.url }
}

export async function requestPasswordReset(
  values: ForgotPasswordInput
): Promise<AuthActionResult> {
  const limited = await enforceAuthRateLimit("auth.reset", 5)
  if (limited) return limited

  const parsed = forgotPasswordSchema.safeParse(values)

  if (!parsed.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/reset-password")}`,
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  // Always succeed to avoid email enumeration on the demo login surface.
  return { success: true }
}

export async function updatePasswordFromRecovery(
  values: ResetPasswordInput
): Promise<AuthActionResult | void> {
  const limited = await enforceAuthRateLimit("auth.updatePassword", 5)
  if (limited) return limited

  const parsed = resetPasswordSchema.safeParse(values)

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
    return {
      error:
        "This reset link is invalid or expired. Request a new password reset email.",
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { error: mapAuthError(error) }
  }

  redirect("/dashboard")
}
