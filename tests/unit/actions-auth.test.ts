import { beforeEach, describe, expect, it, vi } from "vitest"

const createClient = vi.hoisted(() => vi.fn())
const redirect = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT")
  })
)
const reportError = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}))

vi.mock("next/navigation", () => ({
  redirect,
}))

vi.mock("next/headers", () => ({
  headers: vi.fn(async () =>
    new Headers({
      "x-forwarded-for": "203.0.113.10",
      origin: "http://localhost:3000",
    })
  ),
}))

vi.mock("@/lib/observability/report-error", () => ({
  reportError,
}))

import { signIn } from "@/app/actions/auth"
import { resetRateLimitStore } from "@/lib/security/rate-limit"

describe("signIn server action", () => {
  beforeEach(() => {
    resetRateLimitStore()
    createClient.mockReset()
    redirect.mockClear()
    reportError.mockClear()
  })

  it("returns field errors for invalid input", async () => {
    const result = await signIn({
      email: "not-an-email",
      password: "1",
    })
    expect(result).toMatchObject({
      error: "Please fix the errors below.",
    })
    expect(createClient).not.toHaveBeenCalled()
  })

  it("maps invalid credentials without leaking raw messages", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { message: "Invalid login credentials" },
        }),
      },
    })

    const result = await signIn({
      email: "demo@fluxislabs.com",
      password: "secret1",
    })

    expect(result).toEqual({ error: "Invalid email or password." })
    expect(redirect).not.toHaveBeenCalled()
  })

  it("redirects on happy path", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    })

    await expect(
      signIn({
        email: "demo@fluxislabs.com",
        password: "secret1",
      })
    ).rejects.toThrow("NEXT_REDIRECT")

    expect(redirect).toHaveBeenCalledWith("/dashboard")
  })

  it("rate limits repeated sign-in attempts from the same IP", async () => {
    createClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { message: "Invalid login credentials" },
        }),
      },
    })

    for (let i = 0; i < 10; i += 1) {
      await signIn({
        email: "demo@fluxislabs.com",
        password: "secret1",
      })
    }

    const limited = await signIn({
      email: "demo@fluxislabs.com",
      password: "secret1",
    })

    expect(limited).toMatchObject({
      error: expect.stringMatching(/Too many attempts/i),
    })
  })
})
