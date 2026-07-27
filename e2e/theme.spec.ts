import { test, expect } from "@playwright/test"

test.describe("theme", () => {
  test("toggle switches document theme class", async ({ page }) => {
    await page.goto("/")

    const html = page.locator("html")
    const toggle = page.getByRole("button", { name: /Switch to (light|dark) theme/i })

    await expect(toggle).toBeVisible()

    const beforeDark = await html.evaluate((el) => el.classList.contains("dark"))
    await toggle.click()
    await expect
      .poll(async () => html.evaluate((el) => el.classList.contains("dark")))
      .not.toBe(beforeDark)

    await toggle.click()
    await expect
      .poll(async () => html.evaluate((el) => el.classList.contains("dark")))
      .toBe(beforeDark)
  })
})
