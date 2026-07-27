# PulseMetrics - Phase Status

| Field | Value |
|---|---|
| **Source** | [`PRD-SOW-PHASES.md`](PRD-SOW-PHASES.md) |
| **Updated** | 25 Jul 2026 |

Track implementation progress across P0-P14. One phase per chat. Mark `done` only when that phase Done checklist is complete.

PRD scope (P0-P14) is complete. Later product work is tracked under **Post-PRD extras** below (not as new PRD phases). Case study: [`CASE-STUDY.md`](CASE-STUDY.md).

| Phase | Name | Status |
|---|---|---|
| **P0** | Kickoff & repo hygiene | done |
| **P1** | shadcn + theme + fonts | done |
| **P2** | Hosted Supabase schema + RLS + seed | done |
| **P3** | Supabase SSR clients + middleware + env | done |
| **P4** | Auth UI + email/password actions | done |
| **P5** | Google setup page + OAuth callback | done |
| **P6** | Dashboard shell (sidebar/topbar/mobile) | done |
| **P7** | Marketing landing page | done |
| **P8** | Legal pages + 404 + SEO/OG | done |
| **P9** | Data layer metrics + Overview KPIs/chart | done |
| **P10** | Analytics page (2x2 charts) | done |
| **P11** | Customers table (read/filter/pagination) | done |
| **P12** | Customers CRUD + bulk status | done |
| **P13** | Settings + Account | done |
| **P14** | Playwright + CI + README | done |

## Baseline (P0)

- Next.js `16.2.10` (App Router)
- React `19.2.4` / `react-dom` `19.2.4`
- Tailwind CSS v4 (`tailwindcss` + `@tailwindcss/postcss`)
- Docs present: `docs/PRD-SOW.md`, `docs/PRD-SOW-PHASES.md`
- Env template: `.env.local.example` ships the hosted Fluxis project URL + publishable key (`NEXT_PUBLIC_*` only). Service role and Sentry tokens stay commented / local-only.

### P1 notes
- Completed: 23 Jul 2026
- Key files touched: `components.json`, `components/ui/*`, `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (temporary smoke)
- Notes: preset `b27GcrRo` (base-rhea); PRD `form` maps to `field` in current shadcn; Geist + JetBrains Mono (Inter replaced for visual identity); obsidian/cyan tokens; `bg-atmosphere` / `bg-grid` / `bg-noise`; next-themes dark default + system; Sonner wired
- Blockers: none
- Next phase: P2

### P2 notes
- Completed: 23 Jul 2026
- Hosted project: `ppwenukxtigxyjfejrfc` (`https://ppwenukxtigxyjfejrfc.supabase.co`)
- Key files: `supabase/config.toml`, `supabase/migrations/20260723180455_init.sql`, `supabase/migrations/20260723180535_security_hardening.sql`, `supabase/seed.sql`, `types/database.ts`, `.env.local.example`, `README.md` (hosted/no-Docker note)
- Applied remotely via Supabase MCP (`apply_migration` + `execute_sql`); verified: 1 confirmed demo user, 25 customers (18/5/2), 90 metric days
- Demo: `demo@fluxislabs.com` / `fluxis-demo-2026`
- No Docker / no `supabase start` / no Inbucket
- Blockers: none
- Next phase: P3

### P3 notes
- Completed: 23 Jul 2026
- Packages: `@supabase/ssr`, `@supabase/supabase-js`
- Key files: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, root `proxy.ts` (Next.js 16 rename of middleware), `app/login`, `app/signup`, `app/dashboard` placeholders, `.env.local.example` + local `.env.local`
- Session refresh via `getClaims()`; unauthenticated `/dashboard/*` → `/login`; authenticated `/login|/signup` → `/dashboard`
- Env: hosted URL + publishable key (`NEXT_PUBLIC_SUPABASE_*`); no Docker / no `supabase start`
- Blockers: none
- Next phase: P4

### P4 notes
- Completed: 23 Jul 2026
- Packages: `react-hook-form`, `zod`, `@hookform/resolvers`
- Key files: `types/auth.ts`, `app/actions/auth.ts`, `app/(auth)/layout.tsx`, `app/(auth)/login`, `app/(auth)/signup`, `app/(auth)/signup/check-email`, `components/auth/*`, README auth notes
- Verified: demo login `demo@fluxislabs.com` → `/dashboard`; signOut → `/login`; signup/check-email pages render
- Email confirm via real inbox (hosted Auth); no Google setup page (P5); no Inbucket/Docker
- Blockers: none
- Next phase: P5

### P5 notes
- Completed: 23 Jul 2026
- Key files: `components/auth/oauth-buttons.tsx`, `app/(auth)/auth/setup-google/page.tsx`, `app/auth/callback/route.ts`, login/signup forms, README + `.env.local.example`
- Google button on login/signup → `/auth/setup-google` (full Supabase + Google Console checklist; no live credentials)
- `/auth/callback` exchanges OAuth code via `exchangeCodeForSession` (ready when provider is enabled)
- Blockers: none
- Next phase: P6

### P6 notes
- Completed: 23 Jul 2026
- Key files: `app/dashboard/layout.tsx`, `components/dashboard/*` (sidebar, topbar, mobile sheet, user menu, nav), placeholder pages under `app/dashboard/{analytics,customers,settings,account}`
- Shell: grouped sidebar (Dashboard/Insights/Customers/Settings/Account), topbar title + theme toggle + no-op search + avatar menu, mobile sheet drawer, cyan grid/noise atmosphere
- No real KPIs/charts/customers/settings forms (deferred)
- Blockers: none
- Next phase: P7

### P7 notes
- Completed: 23 Jul 2026
- Key files: `app/page.tsx`, `components/landing/*` (header, hero, features, CSS dashboard preview, pricing, FAQ, testimonials, demo credentials, footer, logo), `app/globals.css` (landing motion + smooth scroll)
- Sections per FR-01: Hero (CTA → `#demo-credentials` + Sign up), Features, CSS mini preview, Pricing Basic/Plus/Premium (no checkout), FAQ (10), Testimonials carousel (5), demo credentials with copy + login, Footer ("Built by Fluxis Labs" text only; GitHub + Privacy/Terms links; no Privacy/Terms bodies - P8)
- Blockers: none
- Next phase: P8

### P8 notes
- Completed: 23 Jul 2026
- Key files: `app/privacy/page.tsx`, `app/terms/page.tsx`, `components/legal/legal-page.tsx`, `app/not-found.tsx`, `app/layout.tsx` (full OG/Twitter + metadataBase), `app/dashboard/layout.tsx` (OG/Twitter + noindex), `public/og.png`, `.env.local.example` (`NEXT_PUBLIC_SITE_URL`)
- Privacy/Terms Fluxis stubs with contact `fluxislabs@gmail.com`; branded 404 ("Signal lost"); static OG placeholder
- Blockers: none
- Next phase: P9

### P9 notes
- Completed: 23 Jul 2026
- Packages: `recharts` (+ shadcn `components/ui/chart.tsx`)
- Key files: `lib/data/metrics.ts`, `types/metrics.ts`, `lib/utils.ts` (compact EUR/number/percent helpers), `components/dashboard/{kpi-card,period-switcher,metrics-chart,metrics-empty-state,overview-skeleton}.tsx`, `app/dashboard/page.tsx`
- Overview: 4 KPI cards (vs 7d ago; churn inverted), MRR Line/Bar client island, `?range=7d|30d|90d` (default 7d), Suspense skeletons, empty state for unseeded tenants
- Verified: demo user KPIs + chart for 7d/30d/90d; no Supabase calls in Client Components
- Blockers: none
- Next phase: P10

### P10 notes
- Completed: 23 Jul 2026
- Key files: `app/dashboard/analytics/page.tsx`, `components/dashboard/{analytics-charts,analytics-skeleton}.tsx`
- Analytics 2x2: MRR cyan (`chart-1`), Active Users blue (`chart-2`), Churn amber (`chart-3`), ARPU green (`chart-4`); reuses `getOverviewMetrics` + `PeriodSwitcher` with `basePath=/dashboard/analytics`
- Shared `?range=7d|30d|90d` with Overview; Suspense skeleton + empty state
- Verified: demo user four line charts for 7d/90d; range links stay on `/dashboard/analytics`
- Blockers: none
- Next phase: P11

### P11 notes
- Completed: 23 Jul 2026
- Key files: `lib/data/customers.ts`, `types/customers.ts`, `app/dashboard/customers/page.tsx`, `components/dashboard/customers-{table,search,status-filter,pagination,empty-state,skeleton}.tsx`, `lib/utils.ts` (`formatCurrency`, `formatDisplayDate`)
- Server-side `?q=&status=&page=` (page size 20); All excludes archived; sort `created_at desc`; disabled Add CTA (CRUD in P12)
- Verified: demo user 25 customers; trial=5; search `acme`=1; page 2 of 2; archived row excluded from All
- Blockers: none
- Next phase: P12

### P12 notes
- Completed: 23 Jul 2026
- Key files: `app/actions/customers.ts`, `types/customers.ts` (form/bulk Zod), `components/dashboard/{customers-workspace,customer-form-dialog,customer-archive-dialog,customers-bulk-bar}.tsx`, updated table/empty/page
- Create/edit RHF dialogs (empty create defaults); row click → edit; Delete → soft archive AlertDialog; bulk Active/Trial/Cancelled; Add CTA + mobile FAB; `cancelled_at` auto-set/clear; `revalidatePath` + redirect same URL
- Verified: demo tenant create/update/bulk/archive via RLS; UI create/edit/archive dialogs; archived excluded from All
- Blockers: none
- Next phase: P13

### P13 notes
- Completed: 23 Jul 2026
- Key files: `types/profile.ts`, `lib/data/profile.ts`, `app/actions/profile.ts`, `components/dashboard/{settings-form,account-forms}.tsx`, `app/dashboard/{settings,account}/page.tsx`
- Settings: company name + full name save to `profiles` (Sonner toast); theme preference display (local via next-themes / topbar toggle)
- Account: email read-only; full name edit; change password (`auth.updateUser`); sign out (existing `signOut` action)
- Verified: settings persist on hosted Supabase; password change toast success; sign out → `/login`; demo password restored
- Blockers: none
- Next phase: P14

### P14 notes
- Completed: 23 Jul 2026
- Key files: `playwright.config.ts`, `playwright.hosted.config.ts`, `e2e/*`, `.github/workflows/ci.yml`, `lib/e2e/mock*.ts`, `README.md`, package scripts
- CI: lint + build + Playwright mock auth (`PULSE_E2E_MOCK_AUTH=1` + `pulse_e2e_mock` cookie); no Docker / no Inbucket
- Hosted e2e: `npm run test:e2e:hosted` against `.env.local` (demo login + customers CRUD)
- Portfolio README: setup, hosted Supabase/`db push`, demo login, real-inbox confirm, architecture, folder map, stack
- Blockers: none
- Next phase: none (P0-P14 complete)

## Next phase

All phases **P0-P14** are done. No further phase chats required for the PRD scope.

## Post-PRD extras

Shipped after the PRD checklist. These are portfolio product layers on top of P0-P14, not missing PRD work.

| Extra | Status | Notes |
|---|---|---|
| Metrics ingest (manual + CSV + export) | done | `/dashboard/metrics`; writes `metric_points` used by Overview/Analytics; CSV export mirrors import shape |
| Customer activity events | done | `customer_activity_events` + RLS; written on create/update/archive; detail page prefers DB rows |
| Real notifications | done | `notifications` table + RLS; topbar reads `created_at` / `read_at` rows |
| Onboarding checklist | done | Wired to real `hasCustomers` / `hasMetrics` plus analytics explore |
| Billing showcase | done | `/dashboard/billing`; persists `profiles.billing_plan`; **no Stripe** + Checkout wiring dialog |
| Team invites showcase | done | `/dashboard/team` + `team_invites` RLS; **no shared ACL** (intentional demo) |
| Google OAuth checklist | done | `/auth/setup-google` + `/auth/callback`; live provider optional via env |
| Production ops (Tier 3) | done | Analytics/Speed Insights hooks, Sentry hooks, CSP headers, Lighthouse CI, advisors index |
| Portfolio packaging | done | MIT `LICENSE`, README badges/screenshots, [`CASE-STUDY.md`](CASE-STUDY.md), demo-surface labeling |
| Eng quality signals | done | `npm run typecheck` in CI; broader Vitest (CSV, query helpers, mocked actions); auth IP throttle; user-safe action errors |

### Intentional demo surfaces (not unfinished)

Call these out in reviews instead of treating them as gaps:

1. **Billing** - fake checkout updates plan on profile only; UI docs how Stripe Checkout would wire
2. **Team** - invite rows without membership / shared RLS (no half-shared workspace)
3. **Google OAuth** - checklist by default until `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=1`

### Env reality check

| Item | Reality |
|---|---|
| `.env.local.example` | Hosted Supabase URL + publishable key (safe `NEXT_PUBLIC_*`) |
| Local `.env.local` | Gitignored; copy from example for `npm run dev` / hosted e2e |
| Service role | Never committed; optional for admin/seed scripts only |
| `NEXT_PUBLIC_SITE_URL` | Optional; set on Vercel to the production origin |
