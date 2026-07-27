import { beforeEach, describe, expect, it, vi } from "vitest"

const createClient = vi.hoisted(() => vi.fn())
const revalidatePath = vi.hoisted(() => vi.fn())
const redirect = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT")
  })
)
const reportError = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}))

vi.mock("next/cache", () => ({
  revalidatePath,
}))

vi.mock("next/navigation", () => ({
  redirect,
}))

vi.mock("@/lib/observability/report-error", () => ({
  reportError,
}))

import { createCustomer } from "@/app/actions/customers"

function mockClient(options: {
  user?: { id: string } | null
  insertResult?: { data: { id: string } | null; error: { message: string } | null }
}) {
  const user = options.user === undefined ? { id: "tenant-1" } : options.user
  const insertResult = options.insertResult ?? {
    data: { id: "11111111-1111-4111-8111-111111111111" },
    error: null,
  }

  const activityInsert = vi.fn().mockResolvedValue({ error: null })
  const notificationsInsert = vi.fn().mockResolvedValue({ error: null })

  const customerInsert = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue(insertResult),
    }),
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "customers") {
        return { insert: customerInsert }
      }
      if (table === "customer_activity_events") {
        return { insert: activityInsert }
      }
      if (table === "notifications") {
        return { insert: notificationsInsert }
      }
      return { insert: vi.fn() }
    }),
    _spies: { customerInsert, activityInsert, notificationsInsert },
  }
}

const validInput = {
  name: "Acme Co",
  email: "ops@acme.test",
  company: "Acme",
  status: "active" as const,
  mrr: 129,
  plan_name: "Plus" as const,
}

describe("createCustomer server action", () => {
  beforeEach(() => {
    createClient.mockReset()
    revalidatePath.mockClear()
    redirect.mockClear()
    reportError.mockClear()
  })

  it("returns validation errors without touching supabase", async () => {
    const result = await createCustomer(
      {
        ...validInput,
        email: "not-email",
      },
      "/dashboard/customers"
    )

    expect(result).toMatchObject({
      error: "Please fix the errors below.",
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it("requires an authenticated user", async () => {
    createClient.mockResolvedValue(mockClient({ user: null }))

    const result = await createCustomer(validInput, "/dashboard/customers")
    expect(result).toEqual({
      error: "You must be signed in to create a customer.",
    })
  })

  it("maps insert failures to a user-safe message", async () => {
    createClient.mockResolvedValue(
      mockClient({
        insertResult: {
          data: null,
          error: { message: "duplicate key value violates unique constraint" },
        },
      })
    )

    const result = await createCustomer(validInput, "/dashboard/customers")
    expect(result).toEqual({ error: "Failed to create customer." })
    expect(reportError).toHaveBeenCalled()
  })

  it("happy path writes activity and redirects", async () => {
    const client = mockClient({})
    createClient.mockResolvedValue(client)

    await expect(
      createCustomer(validInput, "/dashboard/customers")
    ).rejects.toThrow("NEXT_REDIRECT")

    expect(client._spies.customerInsert).toHaveBeenCalled()
    expect(client._spies.activityInsert).toHaveBeenCalled()
    expect(client._spies.notificationsInsert).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith("/dashboard/customers")
  })
})
