# PulseMetrics - Case Study

Portfolio SaaS analytics shell by [Fluxis Labs](https://github.com/Marko-Vuchko). One page for recruiters and engineering leads: problem, architecture, trade-offs, and what a v2 would add.

## Problem

Indie founders and small operators need a believable MRR / churn / ARPU workspace without standing up a full billing stack. Most portfolio dashboards either fake everything in memory or ship a half-wired Stripe checkout. PulseMetrics aims for the middle: **real multi-tenant data with RLS**, a polished App Router product shell, and **intentionally scoped demo surfaces** where payments, shared ACL, and OAuth credentials would otherwise dominate the timeline.

## Architecture

```text
Browser
  └─ Next.js 16 App Router (RSC + Server Actions + Zod)
       ├─ proxy.ts → session refresh / route guards
       ├─ lib/supabase/* → SSR + browser clients (@supabase/ssr)
       ├─ lib/data/* → tenant-scoped metrics, customers, profile, team
       └─ Hosted Supabase (Auth JWT + Postgres RLS)
```

| Concern | Choice |
|---|---|
| Tenancy | `tenant_id = auth.uid()` (owner-as-tenant) |
| Mutations | Server Actions validated with Zod |
| Charts | Recharts client islands over RSC-fetched series |
| QA | `tsc --noEmit`, Vitest (schemas + helpers + mocked Server Actions), Playwright mock auth, Lighthouse |
| Ops | Vercel Analytics / Speed Insights, optional Sentry, CSP headers |
| Abuse | In-memory IP throttle on auth Server Actions (per isolate); shared store (Upstash) for multi-instance prod |

Product loop that is production-credible today: **signup / demo login → Overview KPIs → Analytics → Customers CRUD → Metrics ingest (manual + CSV)**.

## Trade-offs (deliberate)

1. **Hosted Supabase only** - no Docker, no `supabase start`, no Inbucket. Email confirmation hits a real inbox. Faster for reviewers; weaker for fully offline local repro.
2. **Billing is a showcase** - plan changes persist on `profiles.billing_plan`. No Stripe Checkout, webhooks, or tax. The Billing UI includes a short "how Stripe Checkout would wire" sketch instead of a half-integrated payment path.
3. **Team invites without shared ACL** - invite rows are real and RLS-scoped to the owner. Accepting an invite does not grant another user access to the tenant. Shared workspaces would need `tenant_members` + policy redesign.
4. **Hero depth on Customers + Metrics** - activity events and notifications are real tenant-scoped tables with RLS; metrics CSV export sits beside import; onboarding checklist reads real empty/filled states.
5. **Google OAuth is checklist-first** - `/auth/callback` and PKCE are wired; live Client ID/Secret stay optional via `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED`. Email/password is the primary demo path.
6. **Auth abuse + safe errors** - process-local IP throttle on sign-in / sign-up / reset / Google; Server Actions map Supabase failures to user-safe copy and `reportError` (Sentry when configured). Multi-instance production would swap the limiter for Upstash Redis (or similar) without changing the action API.

## What v2 would add

- Shared workspaces (`tenant_members`) with invite accept + RLS membership checks
- Stripe Checkout + Customer Portal (or a documented Upstash-backed billing webhook path)
- Live Google OAuth enabled by default on the production project
- Shared rate-limit store (Upstash) across Vercel isolates
- Realtime notification delivery (currently request-time reads)

## Demo credentials

| Field | Value |
|---|---|
| Email | `demo@fluxislabs.com` |
| Password | `fluxis-demo-2026` |

Run locally with `npm run dev` against the hosted Supabase project (see README). Implementation phases: [PHASE-STATUS.md](PHASE-STATUS.md). Full requirements: [PRD-SOW.md](PRD-SOW.md).
