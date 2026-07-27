import { defineConfig, devices } from "@playwright/test"

/**
 * Hosted Supabase e2e - run via `npm run test:e2e:hosted`.
 * Requires `.env.local` with real NEXT_PUBLIC_SUPABASE_* (Next loads it for `next dev`).
 */
process.env.PULSE_E2E_HOSTED = "1"
process.env.PULSE_E2E_MOCK_AUTH = ""

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/walkthrough.record.spec.ts", "**/stills.record.spec.ts"],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
