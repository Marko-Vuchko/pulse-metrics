import { test, expect } from "@playwright/test"

const hosted = process.env.PULSE_E2E_HOSTED === "1"
const demoEmail = process.env.E2E_DEMO_EMAIL ?? "demo@fluxislabs.com"
const demoPassword = process.env.E2E_DEMO_PASSWORD ?? "fluxis-demo-2026"

test.describe("hosted Supabase e2e", () => {
  test.skip(
    !hosted,
    "Set PULSE_E2E_HOSTED=1 and .env.local to run against hosted Supabase"
  )

  test("demo login shows overview KPIs", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(demoEmail)
    await page.getByLabel("Password").fill(demoPassword)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 })
    ).toBeVisible()
    await expect(page.getByText("MRR", { exact: true }).first()).toBeVisible()
  })

  test("customers filter, search, create, edit, archive", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill(demoEmail)
    await page.getByLabel("Password").fill(demoPassword)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })

    await page.goto("/dashboard/customers")
    await expect(
      page.getByRole("searchbox", {
        name: /Search customers by name or email/i,
      })
    ).toBeVisible()

    await page.goto("/dashboard/customers?status=trial")
    await expect(page.getByRole("table")).toBeVisible()

    const unique = `E2E ${Date.now()}`
    const email = `e2e-${Date.now()}@example.com`

    await page.getByRole("button", { name: /Add customer/i }).first().click()
    await page.getByLabel("Name").fill(unique)
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("MRR (EUR)").fill("99.00")
    await page.getByRole("button", { name: "Create customer" }).click()
    await expect(page.getByText(unique)).toBeVisible({ timeout: 15_000 })

    await page.getByText(unique).click()
    await page.getByLabel("Company").fill("E2E Co")
    await page.getByRole("button", { name: "Save changes" }).click()
    await expect(page.getByText("E2E Co")).toBeVisible({ timeout: 15_000 })

    await page.getByText(unique).click()
    await page.getByRole("button", { name: "Delete" }).click()
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click()
    await expect(page.getByText(unique)).toHaveCount(0, { timeout: 15_000 })
  })
})
