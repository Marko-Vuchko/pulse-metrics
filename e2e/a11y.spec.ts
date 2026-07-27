import AxeBuilder from "@axe-core/playwright"
import { test, expect } from "@playwright/test"

const hosted = process.env.PULSE_E2E_HOSTED === "1"

async function expectNoSeriousA11yViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()

  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious"
  )

  expect(
    serious,
    serious
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help}`
      )
      .join("\n")
  ).toEqual([])
}

test.describe("a11y smoke", () => {
  test("landing has no serious axe violations", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("link", { name: "Skip to content" })
    ).toBeAttached()
    await expectNoSeriousA11yViolations(page)
  })

  test("login has no serious axe violations", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await expect(page.getByLabel(/email/i).first()).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })

  test("dashboard has no serious axe violations", async ({
    page,
    context,
  }) => {
    test.skip(hosted, "Mock suite skipped when PULSE_E2E_HOSTED=1")

    await context.addCookies([
      {
        name: "pulse_e2e_mock",
        value: "1",
        url: "http://127.0.0.1:3000",
      },
    ])

    await page.goto("/dashboard")
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 })
    ).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })
})
