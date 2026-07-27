import { test, expect } from "@playwright/test"

const hosted = process.env.PULSE_E2E_HOSTED === "1"
const ACME_ID = "11111111-1111-4111-8111-111111111111"

test.describe("dashboard (mock auth)", () => {
  test.skip(hosted, "Mock suite skipped when PULSE_E2E_HOSTED=1")

  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "pulse_e2e_mock",
        value: "1",
        url: "http://127.0.0.1:3000",
      },
    ])
  })

  test("overview shows KPIs", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(
      page.getByRole("heading", { name: "Overview", level: 2 })
    ).toBeVisible()
    await expect(page.getByText("MRR", { exact: true }).first()).toBeVisible()
    await expect(
      page.getByText("Active Users", { exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByText("Churn Rate", { exact: true }).first()
    ).toBeVisible()
    await expect(page.getByText("ARPU", { exact: true }).first()).toBeVisible()
  })

  test("analytics shows synced metric charts", async ({ page }) => {
    await page.goto("/dashboard/analytics")
    await expect(
      page.getByRole("heading", { name: "Analytics", level: 2 })
    ).toBeVisible()
    await expect(page.getByText("MRR", { exact: true }).first()).toBeVisible()
    await expect(
      page.getByText("Active Users", { exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByText("Churn Rate", { exact: true }).first()
    ).toBeVisible()
    await expect(page.getByText("ARPU", { exact: true }).first()).toBeVisible()
  })

  test("metrics ingest workspace loads", async ({ page }) => {
    await page.goto("/dashboard/metrics")
    await expect(
      page.getByRole("heading", { name: "Metrics ingest", level: 2 })
    ).toBeVisible()
    await expect(page.getByRole("tab", { name: "Manual entry" })).toBeVisible()
    await expect(page.getByRole("tab", { name: "CSV import" })).toBeVisible()
    await expect(page.getByText("Add or update a day")).toBeVisible()
  })

  test("team invites workspace loads", async ({ page }) => {
    await page.goto("/dashboard/team")
    await expect(
      page.getByRole("heading", { name: "Team", level: 2 })
    ).toBeVisible()
    await expect(
      page.getByText("Invite teammate", { exact: true })
    ).toBeVisible()
    await expect(page.getByText("alex@example.com")).toBeVisible()
  })

  test("billing showcase loads", async ({ page }) => {
    await page.goto("/dashboard/billing")
    await expect(
      page.getByRole("heading", { name: "Billing", level: 2 })
    ).toBeVisible()
    await expect(page.getByText("Current plan")).toBeVisible()
    await expect(page.getByText("Basic", { exact: true }).first()).toBeVisible()
  })

  test("command palette opens from topbar", async ({ page }) => {
    await page.goto("/dashboard")
    await page.getByRole("button", { name: "Open command palette" }).click()
    const search = page.getByPlaceholder("Search pages, customers, actions...")
    await expect(search).toBeVisible()
    await search.fill("Analytics")
    await expect(page.getByText("Analytics", { exact: true }).first()).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(search).toBeHidden()
  })

  test("customers search and status filter", async ({ page }) => {
    await page.goto("/dashboard/customers")
    await expect(
      page.getByRole("searchbox", {
        name: /Search customers by name or email/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole("cell", { name: "Acme Analytics", exact: true })
    ).toBeVisible()

    await page
      .getByRole("searchbox", { name: /Search customers by name or email/i })
      .fill("acme")
    await page.getByRole("button", { name: "Search", exact: true }).click()
    await expect(page).toHaveURL(/q=acme/)
    await expect(
      page.getByRole("cell", { name: "Acme Analytics", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("cell", { name: "Bright Labs", exact: true })
    ).toHaveCount(0)

    await page.goto("/dashboard/customers?status=trial")
    await expect(
      page.getByRole("cell", { name: "Bright Labs", exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByRole("cell", { name: "Acme Analytics", exact: true })
    ).toHaveCount(0)
  })

  test("customer detail page loads", async ({ page }) => {
    await page.goto(`/dashboard/customers/${ACME_ID}`)
    await expect(
      page.getByRole("heading", { name: "Acme Analytics" })
    ).toBeVisible()
    await expect(page.getByText("ops@acme.example")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Activity", level: 3 })
    ).toBeVisible()
  })
})
