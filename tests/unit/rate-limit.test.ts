import { beforeEach, describe, expect, it } from "vitest"

import {
  checkRateLimit,
  rateLimitKey,
  resetRateLimitStore,
} from "@/lib/security/rate-limit"

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  it("allows traffic under the limit", () => {
    const key = rateLimitKey("auth.signIn", "1.2.3.4")
    for (let i = 0; i < 3; i += 1) {
      expect(checkRateLimit(key, { limit: 3, windowMs: 60_000, now: 1000 + i })
        .ok).toBe(true)
    }
  })

  it("blocks when the window is exhausted and reports retryAfter", () => {
    const key = rateLimitKey("auth.signIn", "9.9.9.9")
    const windowMs = 60_000
    expect(checkRateLimit(key, { limit: 2, windowMs, now: 0 }).ok).toBe(true)
    expect(checkRateLimit(key, { limit: 2, windowMs, now: 1000 }).ok).toBe(true)

    const blocked = checkRateLimit(key, { limit: 2, windowMs, now: 2000 })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0)
    }
  })

  it("slides the window as time advances", () => {
    const key = rateLimitKey("auth.signUp", "5.5.5.5")
    const windowMs = 10_000
    expect(checkRateLimit(key, { limit: 1, windowMs, now: 0 }).ok).toBe(true)
    expect(checkRateLimit(key, { limit: 1, windowMs, now: 5000 }).ok).toBe(false)
    expect(checkRateLimit(key, { limit: 1, windowMs, now: 10_001 }).ok).toBe(
      true
    )
  })
})
