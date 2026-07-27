/**
 * Process-local sliding-window rate limiter for Server Actions.
 *
 * Good enough for a single Node/Vercel isolate in a portfolio demo.
 * Production multi-instance abuse controls should use a shared store
 * (e.g. Upstash Redis) - see docs/CASE-STUDY.md.
 */

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number }

type Bucket = {
  timestamps: number[]
}

const store = new Map<string, Bucket>()

const DEFAULT_LIMIT = 10
const DEFAULT_WINDOW_MS = 15 * 60 * 1000

export type RateLimitOptions = {
  /** Max successful checks inside the window. */
  limit?: number
  /** Sliding window length in ms. */
  windowMs?: number
  /** Injected clock for tests. */
  now?: number
}

/** Clear all buckets (unit tests only). */
export function resetRateLimitStore(): void {
  store.clear()
}

/**
 * Record an attempt for `key`. Returns ok:false when the window is exhausted.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? DEFAULT_LIMIT
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
  const now = options.now ?? Date.now()
  const cutoff = now - windowMs

  let bucket = store.get(key)
  if (!bucket) {
    bucket = { timestamps: [] }
    store.set(key, bucket)
  }

  bucket.timestamps = bucket.timestamps.filter((ts) => ts > cutoff)

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    return { ok: false, retryAfterSec }
  }

  bucket.timestamps.push(now)
  return { ok: true }
}

/** Build a stable key from action name + client identifier. */
export function rateLimitKey(action: string, clientId: string): string {
  return `${action}:${clientId || "unknown"}`
}
