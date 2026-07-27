import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!raw) return null
  try {
    return new URL(raw).host
  } catch {
    return null
  }
})()

const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://vitals.vercel-insights.com",
  "https://va.vercel-scripts.com",
  "https://*.ingest.sentry.io",
  "https://*.ingest.de.sentry.io",
]

if (supabaseHost) {
  connectSrc.push(`https://${supabaseHost}`, `wss://${supabaseHost}`)
}

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js + next-themes need inline; Vercel Analytics/Speed Insights scripts are remote.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Skip source-map upload unless an auth token is present (portfolio default).
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
})
