/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready",
      url: ["http://127.0.0.1:3000/"],
      numberOfRuns: 1,
      // Prefer CI-installed Chrome when CHROME_PATH is set (GitHub Actions).
      ...(process.env.CHROME_PATH
        ? { chromePath: process.env.CHROME_PATH }
        : {}),
      settings: {
        preset: "desktop",
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
        // Marketing shell only - auth/dashboard need seeded sessions.
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.75 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-byte-weight": ["warn", { maxNumericValue: 1600000 }],
        "unused-javascript": ["warn", { maxNumericValue: 350000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
}
