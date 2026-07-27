import { test, expect } from "@playwright/test"
import path from "node:path"

/**
 * Capture portfolio stills at native 1440x900 (same as the app desktop shell).
 * Run: npx playwright test -c playwright.stills.config.ts
 */
const demoEmail = process.env.E2E_DEMO_EMAIL ?? "demo@fluxislabs.com"
const demoPassword = process.env.E2E_DEMO_PASSWORD ?? "fluxis-demo-2026"
const outDir = path.join("docs", "images")

test.describe("portfolio stills", () => {
  test("landing + dashboard overview", async ({ page }) => {
    test.setTimeout(90_000)

    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "PulseMetrics", exact: true })
    ).toBeVisible()
    await page.waitForTimeout(800)
    await page.screenshot({
      path: path.join(outDir, "landing.png"),
      type: "png",
      animations: "disabled",
      fullPage: false,
    })

    await page.goto("/login")
    await page.getByLabel("Email").fill(demoEmail)
    await page.getByLabel("Password").fill(demoPassword)
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 })
    ).toBeVisible()
    await page.waitForTimeout(1200)
    await page.screenshot({
      path: path.join(outDir, "dashboard-mrr.png"),
      type: "png",
      animations: "disabled",
      fullPage: false,
    })
  })
})
