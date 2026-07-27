import { beforeEach, describe, expect, it, vi } from "vitest"

const createClient = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
const isE2EMockSession = vi.hoisted(() => vi.fn())
const reportError = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}))

vi.mock("next/cache", () => ({
  revalidatePath,
}))

vi.mock("@/lib/e2e/mock", () => ({
  isE2EMockSession,
}))

vi.mock("@/lib/observability/report-error", () => ({
  reportError,
}))

import { upsertMetricPoint } from "@/app/actions/metrics"

const validPoint = {
  date: "2026-07-01",
  mrr: 12450,
  active_users: 812,
  churn_rate: 0.024,
  arpu: 42.1,
}

describe("upsertMetricPoint server action", () => {
  beforeEach(() => {
    createClient.mockReset()
    revalidatePath.mockClear()
    isE2EMockSession.mockReset()
    reportError.mockClear()
    isE2EMockSession.mockResolvedValue(false)
  })

  it("returns validation errors", async () => {
    const result = await upsertMetricPoint({
      ...validPoint,
      mrr: -1,
    })
    expect(result).toMatchObject({
      error: "Please fix the errors below.",
    })
  })

  it("maps upsert failures to a user-safe message", async () => {
    const upsert = vi.fn().mockResolvedValue({
      error: { message: "permission denied for table metric_points" },
    })
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "tenant-1" } },
        }),
      },
      from: vi.fn(() => ({ upsert })),
    })

    const result = await upsertMetricPoint(validPoint)
    expect(result).toEqual({ error: "Failed to save metrics." })
    expect(reportError).toHaveBeenCalled()
  })

  it("happy path upserts and revalidates", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const insert = vi.fn().mockResolvedValue({ error: null })
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "tenant-1" } },
        }),
      },
      from: vi.fn((table: string) => {
        if (table === "metric_points") return { upsert }
        if (table === "notifications") return { insert }
        return {}
      }),
    })

    const result = await upsertMetricPoint(validPoint)
    expect(result).toEqual({ success: true, upserted: 1 })
    expect(upsert).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalled()
  })
})
