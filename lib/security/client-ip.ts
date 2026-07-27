import { headers } from "next/headers"

/** Best-effort client IP for abuse throttles (proxy-aware). */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers()
  const forwarded = headerStore.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = headerStore.get("x-real-ip")?.trim()
  if (realIp) return realIp

  return "unknown"
}
