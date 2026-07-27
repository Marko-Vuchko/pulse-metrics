import { beforeEach, describe, expect, it, vi } from "vitest"

const reportError = vi.hoisted(() => vi.fn())

vi.mock("@/lib/observability/report-error", () => ({
  reportError,
}))

import { mapAuthError, toUserSafeError } from "@/lib/actions/safe-error"

describe("toUserSafeError", () => {
  beforeEach(() => {
    reportError.mockClear()
  })

  it("reports the original error and returns the fallback", () => {
    const err = new Error("relation \"customers\" does not exist")
    expect(toUserSafeError(err, "Failed to create customer.")).toBe(
      "Failed to create customer."
    )
    expect(reportError).toHaveBeenCalledWith(err)
  })
})

describe("mapAuthError", () => {
  beforeEach(() => {
    reportError.mockClear()
  })

  it("maps known auth messages", () => {
    expect(mapAuthError({ message: "Invalid login credentials" })).toBe(
      "Invalid email or password."
    )
    expect(mapAuthError({ message: "Email not confirmed" })).toMatch(
      /Confirm your email/
    )
    expect(mapAuthError({ message: "User already registered" })).toMatch(
      /already exists/
    )
  })

  it("never returns raw unknown backend text", () => {
    const raw = "JWT secret mismatch in project xyz-secret-token"
    expect(mapAuthError({ message: raw })).toBe(
      "Authentication failed. Please try again."
    )
    expect(mapAuthError({ message: raw })).not.toContain("xyz-secret")
    expect(reportError).toHaveBeenCalled()
  })
})
