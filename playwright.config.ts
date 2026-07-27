import { defineConfig, devices } from "@playwright/test"

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"
const hosted = process.env.PULSE_E2E_HOSTED === "1"

/**
 * Default: mock auth for CI (`PULSE_E2E_MOCK_AUTH=1`).
 * Hosted: `PULSE_E2E_HOSTED=1 npm run test:e2e:hosted` with `.env.local`.
 */
export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/walkthrough.record.spec.ts", "**/stills.record.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
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
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    // Always start with PULSE_E2E_MOCK_AUTH so local reuse of a normal `next dev` cannot skip mock mode.
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      ...(hosted
        ? { PULSE_E2E_MOCK_AUTH: "" }
        : {
            PULSE_E2E_MOCK_AUTH: "1",
            NEXT_PUBLIC_SUPABASE_URL:
              process.env.NEXT_PUBLIC_SUPABASE_URL ??
              "https://ppwenukxtigxyjfejrfc.supabase.co",
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
              "sb_publishable_ci_mock_key",
          }),
    },
  },
})
