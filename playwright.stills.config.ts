import { defineConfig, devices } from "@playwright/test"

process.env.PULSE_E2E_HOSTED = "1"
process.env.PULSE_E2E_MOCK_AUTH = ""

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

export default defineConfig({
  testDir: "./e2e",
  testMatch: "stills.record.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    // 1x CSS pixels - avoids DPR stretch that makes UI look cramped when scaled.
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium" }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
