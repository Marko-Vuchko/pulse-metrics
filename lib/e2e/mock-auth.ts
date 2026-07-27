/** Cookie set by Playwright when CI/mock e2e runs. */
export const E2E_MOCK_COOKIE = "pulse_e2e_mock"

export const E2E_MOCK_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@fluxislabs.com",
  fullName: "Demo User",
} as const

/** When `1`, middleware + data layer use mock session (CI / `npm run test:e2e`). */
export function isE2EMockAuthEnabled(): boolean {
  return process.env.PULSE_E2E_MOCK_AUTH === "1"
}
