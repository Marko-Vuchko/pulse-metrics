import { test, expect } from "@playwright/test"

test.describe("landing", () => {
  test("hero CTA scrolls to demo credentials", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "PulseMetrics", exact: true })
    ).toBeVisible()
    await expect(page.getByText(/SaaS metrics that stay sharp/i)).toBeVisible()

    await page.getByRole("link", { name: /View demo dashboard/i }).click()
    await expect(page.locator("#demo-credentials")).toBeInViewport()
  })

  test("sign up CTA reaches signup", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: "Sign up" }).first().click()
    await expect(page).toHaveURL(/\/signup/)
  })
})
