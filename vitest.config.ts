import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.{test,spec}.ts"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "types/**/*.ts",
        "lib/utils.ts",
        "lib/metrics/csv.ts",
        "lib/billing/plans.ts",
        "lib/data/customer-activity.ts",
        "lib/data/customer-query.ts",
        "lib/actions/safe-error.ts",
        "lib/security/rate-limit.ts",
      ],
      exclude: ["types/database.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
