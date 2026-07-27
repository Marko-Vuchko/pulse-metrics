import { defineConfig, devices } from "@playwright/test"
import path from "node:path"

/**
 * Records a single Chromium video for the portfolio walkthrough.
 * Output: test-results/walkthrough/.../video.webm
 */
process.env.PULSE_E2E_HOSTED = "1"
process.env.PULSE_E2E_MOCK_AUTH = ""

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const outDir = path.join("test-results", "walkthrough")

export default defineConfig({
  testDir: "./e2e",
  testMatch: "walkthrough.record.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  outputDir: outDir,
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    trace: "off",
    screenshot: "off",
    video: {
      mode: "on",
      size: { width: 1440, height: 900 },
    },
    launchOptions: {
      slowMo: 80,
    },
  },
  projects: [{ name: "chromium" }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
