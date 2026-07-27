# PulseMetrics

[![CI](https://img.shields.io/github/actions/workflow/status/Marko-Vuchko/pulse-metrics/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/Marko-Vuchko/pulse-metrics/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

SaaS analytics dashboard by [Fluxis Labs](https://github.com/Marko-Vuchko) - MRR, churn, ARPU, and customer ops in a dark-first Next.js shell backed by hosted Supabase.

Portfolio demo of App Router, SSR auth, RLS multi-tenant data, shadcn/ui, Recharts, and Playwright CI.

| Demo login (local / hosted Supabase) | Value |
|---|---|
| Email | `demo@fluxislabs.com` |
| Password | `fluxis-demo-2026` |

Case study (problem → architecture → trade-offs → v2): [`docs/CASE-STUDY.md`](docs/CASE-STUDY.md)

## Screenshots

Landing:

![PulseMetrics landing](docs/images/landing.png)

Dashboard overview with MRR chart:

![PulseMetrics dashboard MRR](docs/images/dashboard-mrr.png)

## Intentional demo surfaces

These are scoped on purpose for a portfolio walkthrough - not unfinished stubs:

| Surface | What it does | What it does not |
|---|---|---|
| Billing | Fake checkout persists `billing_plan` on your profile | Stripe, charges, webhooks |
| Team | Invite rows under owner tenant RLS | Shared ACL / teammate data access |
| Notifications | Static topbar alerts for UI polish | DB-backed notification feed |
| Google OAuth | Checklist + `/auth/callback` PKCE route | Live Client ID/Secret (optional via env) |

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, next-themes, Sonner |
| Charts | Recharts |
| Backend | Hosted Supabase (Auth + Postgres + RLS) |
| Forms | react-hook-form + Zod |
| Observability | Vercel Analytics + Speed Insights, optional Sentry |
| QA | ESLint, Vitest (unit), production build, Playwright, Lighthouse CI, GitHub Actions |

## No Docker required

PulseMetrics uses a **hosted** Supabase project only.

- Do **not** run `supabase start`
- Do **not** use Inbucket or a local mail catcher
- Email confirmation uses a **real inbox** (hosted Auth SMTP / Supabase email)

## Quick start

```bash
npm install
cp .env.local.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Hosted Supabase schema

Migrations live in `supabase/migrations/`. Seed data is in `supabase/seed.sql`.

Against a linked hosted project (CLI, no Docker):

```bash
npx supabase link --project-ref <PROJECT_ID>
npx supabase db push
# Seed is applied separately when needed (see supabase/seed.sql)
```

Generate types:

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
```

### Auth URL configuration

In the hosted Supabase dashboard (Authentication → URL configuration):

- **Site URL**: `http://localhost:3000` (dev) and your production URL
- **Redirect URLs**: `http://localhost:3000/login`, `http://localhost:3000/auth/callback` (plus production equivalents)

Signup requires confirming the email via a real inbox before sign-in works.

Google OAuth is checklist-only by default (`/auth/setup-google`). Set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=1` after enabling the provider.

## Motion / ambient (marketing)

Landing, auth, and legal surfaces use a lightweight `AmbientField` (CSS orbs + canvas particles) over the existing atmosphere. No Three.js / Spline (PRD exclusion). Dashboard stays calm. All motion respects `prefers-reduced-motion`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local Next.js server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Vitest unit tests (Zod, helpers, mocked Server Actions) |
| `npm run test:coverage` | Vitest coverage gate (app logic + types) |
| `npm run build` | Production build |
| `npm run test:e2e` | Playwright smoke with **mock auth** (CI default) |
| `npm run test:e2e:hosted` | Full e2e against **hosted** Supabase (needs `.env.local`) |
| `npm run lighthouse` | Lighthouse CI budgets against the landing page (needs a prior `build`) |

## Playwright

### Mock auth (CI / default)

`npm run test:e2e` sets `PULSE_E2E_MOCK_AUTH=1`. Playwright sets a `pulse_e2e_mock` cookie so `/dashboard` loads fixture KPIs and customers without a real session. GitHub Actions runs this path by default - no Supabase service container, no Docker.

Covers: landing CTAs, theme toggle, overview KPIs, customers search/filter, axe a11y smoke (landing / login / dashboard).

### Unit tests

```bash
npm test
```

Vitest covers Zod schemas, pure helpers (`lib/utils`, CSV, customer query parsers, activity diffs, in-memory auth rate limit, safe error mapping), and mocked Server Action happy/error paths (`signIn`, `createCustomer`, `upsertMetricPoint`).

### Hosted e2e (local / optional CI)

With `.env.local` pointing at the hosted project and the demo user seeded:

```bash
npm run test:e2e:hosted
```

This sets `PULSE_E2E_HOSTED=1`, disables mock auth, and runs login + customers CRUD against live Auth/RLS.

Optional overrides: `E2E_DEMO_EMAIL`, `E2E_DEMO_PASSWORD`.

Optional CI: set repository variable `ENABLE_HOSTED_E2E=true` plus secrets `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (and optional demo credentials), then run the workflow via **Actions → CI → Run workflow**.

## Production ops (Tier 3)

| Item | How |
|---|---|
| Vercel Analytics / Speed Insights | Shipped in root layout (`@vercel/analytics`, `@vercel/speed-insights`). Enable the features in the Vercel project dashboard after deploy. |
| Sentry | Optional. Set `NEXT_PUBLIC_SENTRY_DSN`. Error boundaries call `reportError`. Source maps need `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT`. |
| Security headers | CSP, `X-Frame-Options`, `Referrer-Policy`, HSTS, and related headers in `next.config.ts`. |
| Supabase Advisors | Hosted project reviewed; FK index on `team_invites.invited_by` applied. Enable Auth **Leaked password protection** in the Supabase dashboard when going live. |
| Lighthouse | `lighthouserc.js` budgets for landing LCP/a11y/SEO; CI job runs after the quality job. No Three.js / Spline (PRD exclusion). |
| Hosted e2e | Gated on `ENABLE_HOSTED_E2E=true` + Action secrets; manual `workflow_dispatch` only. |

## Architecture

```text
Browser
  └─ Next.js App Router (RSC + Server Actions)
       ├─ proxy.ts → session refresh / route guards
       ├─ lib/supabase/* → SSR + browser clients
       ├─ lib/data/* → tenant-scoped metrics & customers
       └─ Hosted Supabase (Auth JWT + Postgres RLS)
```

- Tenant isolation: `tenant_id = auth.uid()` (profiles: `id = auth.uid()`)
- Dashboard pages fetch in Server Components; charts are client islands
- Mock auth is env-gated (`PULSE_E2E_MOCK_AUTH`) and never used in normal product traffic

## Folder map

```text
app/
  (auth)/          Login, signup, Google setup checklist
  auth/callback/   OAuth PKCE exchange
  dashboard/       Overview, analytics, metrics, customers, team, billing, settings, account
  privacy|terms/   Legal stubs
components/
  auth|dashboard|landing|legal|ui/
lib/
  data/            Metrics + customers + profile queries
  e2e/             Mock auth helpers (CI only)
  supabase/        Browser, server, middleware clients
supabase/
  migrations/      Schema + RLS
  seed.sql         Demo tenant data
e2e/               Playwright specs
.github/workflows/ CI (lint + build + mock Playwright)
docs/              PRD, phase status, case study, README images
types/             Generated DB + Zod domain types
```

## Quality gates

- `npm run lint` and `npm run build` must pass
- GitHub Actions: lint + unit/coverage + build + Playwright (mock auth) + Lighthouse landing budgets
- Full product smoke: `npm run test:e2e:hosted` against hosted Supabase (optional CI via `ENABLE_HOSTED_E2E`)

## License

MIT - see [`LICENSE`](./LICENSE).

Built by Fluxis Labs (Marko Vuchko) as a portfolio product. Requirements: [`docs/PRD-SOW.md`](docs/PRD-SOW.md). Status: [`docs/PHASE-STATUS.md`](docs/PHASE-STATUS.md).
