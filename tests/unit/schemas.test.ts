import { describe, expect, it } from "vitest"

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/types/auth"
import {
  archiveCustomerSchema,
  buildCustomersReturnPath,
  bulkCustomerStatusSchema,
  customerFormSchema,
  updateCustomerSchema,
} from "@/types/customers"
import {
  metricPointFormSchema,
  metricPointWriteSchema,
  metricsRangeSchema,
} from "@/types/metrics"
import {
  accountNameSchema,
  changePasswordSchema,
  settingsSchema,
} from "@/types/profile"
import { checkoutSchema } from "@/types/billing"
import { createTeamInviteSchema } from "@/types/team"

describe("auth schemas", () => {
  it("accepts a valid login payload", () => {
    const parsed = loginSchema.safeParse({
      email: " demo@fluxislabs.com ",
      password: "secret1",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.email).toBe("demo@fluxislabs.com")
    }
  })

  it("rejects short passwords on login", () => {
    const parsed = loginSchema.safeParse({
      email: "demo@fluxislabs.com",
      password: "123",
    })
    expect(parsed.success).toBe(false)
  })

  it("requires matching passwords on signup", () => {
    const mismatch = signUpSchema.safeParse({
      email: "new@fluxislabs.com",
      password: "secret1",
      confirmPassword: "secret2",
    })
    expect(mismatch.success).toBe(false)

    const match = signUpSchema.safeParse({
      email: "new@fluxislabs.com",
      password: "secret1",
      confirmPassword: "secret1",
    })
    expect(match.success).toBe(true)
  })

  it("validates forgot-password email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "demo@fluxislabs.com" }).success
    ).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false
    )
  })

  it("requires matching passwords on reset", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "secret1",
        confirmPassword: "secret2",
      }).success
    ).toBe(false)
    expect(
      resetPasswordSchema.safeParse({
        password: "secret1",
        confirmPassword: "secret1",
      }).success
    ).toBe(true)
  })
})

describe("customer schemas", () => {
  const validForm = {
    name: "Acme Co",
    email: "ops@acme.test",
    company: "Acme",
    status: "active" as const,
    mrr: "129.50",
    plan_name: "Plus" as const,
  }

  it("parses and coerces MRR on create", () => {
    const parsed = customerFormSchema.safeParse(validForm)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.mrr).toBe(129.5)
    }
  })

  it("rejects invalid MRR formats", () => {
    const parsed = customerFormSchema.safeParse({
      ...validForm,
      mrr: "12.999",
    })
    expect(parsed.success).toBe(false)
  })

  it("requires a uuid on update and archive", () => {
    expect(
      updateCustomerSchema.safeParse({ ...validForm, id: "not-a-uuid" }).success
    ).toBe(false)
    expect(
      archiveCustomerSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
      }).success
    ).toBe(true)
  })

  it("requires at least one id for bulk status", () => {
    expect(
      bulkCustomerStatusSchema.safeParse({ ids: [], status: "trial" }).success
    ).toBe(false)
    expect(
      bulkCustomerStatusSchema.safeParse({
        ids: ["11111111-1111-4111-8111-111111111111"],
        status: "trial",
      }).success
    ).toBe(true)
  })

  it("builds customers return paths with defaults stripped", () => {
    expect(buildCustomersReturnPath({})).toBe("/dashboard/customers")
    expect(
      buildCustomersReturnPath({
        q: " acme ",
        status: "trial",
        page: 2,
        sort: "mrr",
        dir: "asc",
      })
    ).toBe("/dashboard/customers?q=acme&status=trial&sort=mrr&dir=asc&page=2")
  })
})

describe("metrics schemas", () => {
  it("accepts known ranges only", () => {
    expect(metricsRangeSchema.safeParse("7d").success).toBe(true)
    expect(metricsRangeSchema.safeParse("14d").success).toBe(false)
  })

  it("validates write payloads", () => {
    const ok = metricPointWriteSchema.safeParse({
      date: "2026-07-01",
      mrr: 12450,
      active_users: 812,
      churn_rate: 0.024,
      arpu: 42.1,
    })
    expect(ok.success).toBe(true)

    const badChurn = metricPointWriteSchema.safeParse({
      date: "2026-07-01",
      mrr: 100,
      active_users: 10,
      churn_rate: 1.5,
      arpu: 5,
    })
    expect(badChurn.success).toBe(false)
  })

  it("coerces form strings into numbers", () => {
    const parsed = metricPointFormSchema.safeParse({
      date: "2026-07-02",
      mrr: "12510.00",
      active_users: "818",
      churn_rate: "0.0238",
      arpu: "42.25",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.active_users).toBe(818)
      expect(parsed.data.churn_rate).toBeCloseTo(0.0238)
    }
  })
})

describe("profile and billing schemas", () => {
  it("validates settings and account name bounds", () => {
    expect(
      settingsSchema.safeParse({
        company_name: "Fluxis",
        full_name: "Marko",
      }).success
    ).toBe(true)
    expect(accountNameSchema.safeParse({ full_name: "" }).success).toBe(false)
  })

  it("requires matching change-password fields", () => {
    expect(
      changePasswordSchema.safeParse({
        password: "secret1",
        confirmPassword: "secret1",
      }).success
    ).toBe(true)
    expect(
      changePasswordSchema.safeParse({
        password: "secret1",
        confirmPassword: "nope",
      }).success
    ).toBe(false)
  })

  it("normalizes demo card numbers for checkout", () => {
    const parsed = checkoutSchema.safeParse({
      plan: "Plus",
      cardholder: "Demo User",
      cardNumber: "4242 4242 4242 4242",
      expiry: "12/30",
      cvc: "123",
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.cardNumber).toBe("4242424242424242")
    }
  })
})

describe("team schemas", () => {
  it("accepts invite payloads with roles", () => {
    expect(
      createTeamInviteSchema.safeParse({
        email: "mate@fluxislabs.com",
        role: "viewer",
      }).success
    ).toBe(true)
    expect(
      createTeamInviteSchema.safeParse({
        email: "bad",
        role: "owner",
      }).success
    ).toBe(false)
  })
})
