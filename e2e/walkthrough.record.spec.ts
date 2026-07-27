import { test, expect } from "@playwright/test"

/**
 * One-shot portfolio walkthrough recorder (30-60s).
 * Run: npx playwright test -c playwright.walkthrough.config.ts
 */
const demoEmail = process.env.E2E_DEMO_EMAIL ?? "demo@fluxislabs.com"
const demoPassword = process.env.E2E_DEMO_PASSWORD ?? "fluxis-demo-2026"

test.describe("portfolio walkthrough", () => {
  test("landing → login → customers CRUD → analytics", async ({ page }) => {
    test.setTimeout(120_000)

    // 1) Landing
    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "PulseMetrics", exact: true })
    ).toBeVisible()
    await page.waitForTimeout(1800)

    // 2) Demo login
    await page.goto("/login")
    await expect(page.getByLabel("Email")).toBeVisible()
    await page.waitForTimeout(600)
    await page.getByLabel("Email").fill(demoEmail)
    await page.waitForTimeout(400)
    await page.getByLabel("Password").fill(demoPassword)
    await page.waitForTimeout(400)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 })
    ).toBeVisible()
    await page.waitForTimeout(1600)

    // 3) Customers CRUD
    await page.goto("/dashboard/customers")
    await expect(
      page.getByRole("searchbox", {
        name: /Search customers by name or email/i,
      })
    ).toBeVisible()
    await page.waitForTimeout(900)

    const unique = `Walk ${Date.now().toString().slice(-6)}`
    const email = `walk-${Date.now()}@example.com`

    await page.getByRole("button", { name: /Add customer/i }).first().click()
    const createDialog = page.getByRole("dialog")
    await expect(createDialog).toBeVisible()
    await createDialog.getByLabel("Name").fill(unique)
    await createDialog.getByLabel("Email").fill(email)
    await createDialog.getByRole("combobox", { name: "Status" }).click()
    await page.getByRole("option", { name: "Active" }).click()
    await createDialog.getByRole("combobox", { name: "Plan" }).click()
    await page.getByRole("option", { name: "Plus" }).click()
    await createDialog.getByLabel("MRR (EUR)").fill("129.00")
    await page.waitForTimeout(500)
    await createDialog.getByRole("button", { name: "Create customer" }).click()
    const createdRow = page.getByRole("row", {
      name: new RegExp(`Select ${unique}`),
    })
    await expect(createdRow).toBeVisible({ timeout: 15_000 })
    await page.waitForTimeout(800)

    await createdRow.click()
    await expect(page).toHaveURL(/\/dashboard\/customers\/[0-9a-f-]+/, {
      timeout: 15_000,
    })
    await expect(page.getByRole("heading", { name: unique })).toBeVisible({
      timeout: 15_000,
    })
    await page.waitForTimeout(700)

    await page.getByRole("button", { name: "Edit" }).click()
    const editDialog = page.getByRole("dialog")
    await expect(editDialog).toBeVisible()
    await editDialog.getByLabel("Company").fill("Walkthrough Co")
    await page.waitForTimeout(400)
    await editDialog.getByRole("button", { name: "Save changes" }).click()
    await expect(page.getByText("Walkthrough Co")).toBeVisible({
      timeout: 15_000,
    })
    await page.waitForTimeout(700)

    await page.getByRole("button", { name: "Archive" }).click()
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete" })
      .click()
    await expect(page).toHaveURL(/\/dashboard\/customers(?:\?|$)/, {
      timeout: 15_000,
    })
    await page.waitForTimeout(900)

    // 4) Analytics
    await page.goto("/dashboard/analytics")
    await expect(
      page.getByRole("heading", { name: "Analytics", level: 2 })
    ).toBeVisible()
    await expect(page.getByText("MRR", { exact: true }).first()).toBeVisible()
    await page.waitForTimeout(2200)
  })
})
