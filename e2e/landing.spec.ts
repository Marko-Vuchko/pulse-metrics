import { test, expect } from "@playwright/test"

test.describe("landing", () => {
  test("hero CTA scrolls to demo credentials", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "PulseMetrics", exact: true })
    ).toBeVisible()
    // Headline words use NBSP between spans - match with flexible whitespace.
    await expect(
      page.locator("p.landing-stagger-2")
    ).toContainText(/SaaS\s+metrics\s+that\s+stay\s+sharp/i)

    await page.getByRole("link", { name: /View demo dashboard/i }).click()
    await expect(page.locator("#demo-credentials")).toBeInViewport()
  })

  test("sign up CTA reaches signup", async ({ page }) => {
    await page.goto("/")
    await page.locator('header a[href="/signup"]').click()
    await expect(page).toHaveURL(/\/signup/)
  })
})
