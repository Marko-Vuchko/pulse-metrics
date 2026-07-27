import { reportError } from "@/lib/observability/report-error"

/**
 * Map unexpected backend failures to a user-safe string.
 * Always reports the original error for observability.
 */
export function toUserSafeError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  reportError(error)
  return fallback
}

/** Known Auth API messages → safe copy. Unknown messages never leak. */
export function mapAuthError(error: unknown): string {
  reportError(error)

  const message =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : ""

  const lower = message.toLowerCase()

  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  ) {
    return "Confirm your email before signing in. Check your inbox for the confirmation link."
  }

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password."
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead."
  }

  if (
    lower.includes("password should be at least") ||
    lower.includes("password is known to be weak") ||
    lower.includes("weak password")
  ) {
    return "Choose a stronger password and try again."
  }

  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "Too many attempts. Please wait a moment and try again."
  }

  return "Authentication failed. Please try again."
}
