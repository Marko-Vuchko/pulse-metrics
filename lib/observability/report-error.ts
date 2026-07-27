import * as Sentry from "@sentry/nextjs"

/** Log locally and forward to Sentry when a DSN is configured. */
export function reportError(error: unknown) {
  console.error(error)
  Sentry.captureException(error)
}
