# PulseMetrics - Phased PRD / SoW (Agent Chat Pack)

| Field | Value |
|---|---|
| **Document type** | Phased PRD + SoW for multi-chat agent execution |
| **Product** | PulseMetrics |
| **Studio** | Fluxis Labs |
| **Source of truth** | [`docs/PRD-SOW.md`](PRD-SOW.md) + Cursor plan `pulsemetrics_saas_scaffold_0024a82c` |
| **Version** | 1.0 |
| **Date** | 23 Jul 2026 |
| **Goal of this file** | Split all work into **small phases** so each Cursor chat/agent can finish one phase without hitting **SummarizeText** |

---

## How to use this document

1. Open a **new Cursor chat** for each phase (do not continue a long chat across phases).
2. Paste the **Agent prompt** for that phase (bottom of each section).
3. Attach this file + [`docs/PRD-SOW.md`](PRD-SOW.md) as context (or `@` them).
4. Tell the agent: implement **only this phase**; do not start the next phase.
5. When the phase **Done checklist** is green, commit (if you want), then open a **new chat** for the next phase.
6. Never dump the full chat history into a new agent - use this file + PRD instead.

### Anti-SummarizeText rules (for every agent)

- One phase per chat.
- Do not re-negotiate product decisions; they are locked in PRD.
- Do not rewrite unrelated files.
- Prefer reading only files listed in the phase.
- Stop when the phase Done checklist is complete.
- If blocked, write a short `docs/PHASE-NOTES.md` note and stop (do not expand scope).

### Global hard constraints (all phases)

- Next.js App Router (read `node_modules/next/dist/docs/` before unfamiliar APIs).
- No Stripe / payments / webhooks.
- No DB queries inside Client Components.
- Mock analytics source of truth = Supabase seed only.
- No Three.js / Spline.
- No `// TODO: implement later` stubs - ship working empty states.
- English UI copy only.
- Demo login (after seed exists): `demo@fluxislabs.com` / `fluxis-demo-2026`.
- **No Docker.** Use a **hosted Supabase** project only. Never run `supabase start` or depend on Inbucket/local containers.
- **P2 seed autonomy:** Agent applies migrations + seed to hosted Supabase themselves (MCP preferred). Do not ask the human to paste SQL into the Dashboard.

### Phase map (execute in order)

| Phase | Name | Est. chat size | Depends on |
|---|---|---|---|
| **P0** | Kickoff & repo hygiene | XS | - |
| **P1** | shadcn + theme + fonts | S | P0 |
| **P2** | Hosted Supabase schema + RLS + seed | M | P0 |
| **P3** | Supabase SSR clients + middleware + env | S | P2 |
| **P4** | Auth UI + email/password actions | M | P1, P3 |
| **P5** | Google setup page + OAuth callback | S | P4 |
| **P6** | Dashboard shell (sidebar/topbar/mobile) | M | P1, P4 |
| **P7** | Marketing landing page | M | P1 |
| **P8** | Legal pages + 404 + SEO/OG | S | P1, P7 |
| **P9** | Data layer metrics + Overview KPIs/chart | M | P2, P6 |
| **P10** | Analytics page (2x2 charts) | S | P9 |
| **P11** | Customers table (read/filter/pagination) | M | P2, P6 |
| **P12** | Customers CRUD + bulk status | M | P11 |
| **P13** | Settings + Account | S | P4, P6 |
| **P14** | Playwright + CI + README | M | P4-P13 |

**Total: 15 phases (P0-P14).** Keep each chat to one phase.

---

## Shared reference (do not re-ask)

### Demo credentials

- Email: `demo@fluxislabs.com`
- Password: `fluxis-demo-2026`

### URL conventions

`?q=&status=&page=&range=` where `range` ∈ `7d|30d|90d` (shared Overview + Analytics).

### Visual

- Obsidian + electric cyan; dark-first; system preference respected.
- Fonts: Geist (body/heading) + JetBrains Mono (accent).
- Atmosphere: cyan grid + fine noise.
- Currency: EUR, compact KPI format.
- Sidebar groups: Dashboard (Overview) | Insights (Analytics) | Customers | Settings | Account.

### Customer status

`active | trial | cancelled | archived`  
Delete UI = soft archive. Filter All excludes archived. No restore in v1.

### Stack reminders

- shadcn: `npx shadcn@latest init --preset b27GcrRo --template next --pointer`
- Charts: Recharts
- Forms: react-hook-form + zodResolver + Zod (shared in `types/`)
- Toasts: Sonner
- Contact (legal): `fluxislabs@gmail.com`
- Footer Fluxis: text only "Built by Fluxis Labs" (no website URL)
- GitHub footer: `https://github.com/Marko-Vuchko`

Full detail: [`docs/PRD-SOW.md`](PRD-SOW.md).

---

# PHASE P0 - Kickoff & repo hygiene

## Goal

Confirm repo baseline and create a tiny handoff note so later chats know where to start.

## In scope

- Verify Next.js 16 / React 19 / Tailwind v4 scaffold exists.
- Ensure `docs/PRD-SOW.md` and this file exist.
- Create `docs/PHASE-STATUS.md` with all phases marked `pending`.
- Create `.env.local.example` stub headers only (no secrets) if missing.

## Out of scope

- Installing shadcn, Supabase, auth, UI, or features.

## Files

- Create/update: `docs/PHASE-STATUS.md`
- Optional: `.env.local.example` (placeholder keys only)

## Done checklist

- [ ] `docs/PHASE-STATUS.md` lists P0-P14 with status
- [ ] P0 marked `done` in that file
- [ ] No product features added

## Agent prompt (copy/paste)

```text
You are implementing PulseMetrics PHASE P0 only.
Read docs/PRD-SOW-PHASES.md (P0) and docs/PRD-SOW.md for context.
Do NOT implement later phases.
Create docs/PHASE-STATUS.md tracking P0-P14.
Optionally create .env.local.example with placeholder NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / comments for demo credentials.
Mark P0 done in PHASE-STATUS.md. Stop when Done checklist is complete.
```

---

# PHASE P1 - shadcn + theme + fonts

## Goal

Install shadcn preset and establish Fluxis visual foundation (tokens, fonts, theme provider, Sonner).

## In scope

- Run: `npx shadcn@latest init --preset b27GcrRo --template next --pointer`
- Add primitives needed later (at minimum): button, card, input, label, table, tabs, select, badge, separator, avatar, sheet, dialog, alert-dialog, dropdown-menu, checkbox, form, sonner, skeleton, accordion, carousel, toggle-group
- Obsidian + electric cyan CSS variables in `app/globals.css`
- Subtle cyan grid + fine noise atmosphere utilities
- `next-themes` (dark default, respect system)
- Fonts: Geist + JetBrains Mono via `next/font` in root layout
- Wire ThemeProvider + Toaster in root layout
- Update root metadata title/description (basic)

## Out of scope

- Supabase, auth pages, dashboard routes, landing sections, charts

## Done checklist

- [ ] `components.json` exists
- [ ] `components/ui/*` primitives present
- [ ] Dark/light toggle works on a temporary smoke page OR root page
- [ ] Fonts and cyan/obsidian tokens visible
- [ ] `npm run lint` still passes (or fix issues introduced here)
- [ ] Mark P1 done in `docs/PHASE-STATUS.md`

## Agent prompt

```text
Implement PulseMetrics PHASE P1 only (shadcn + theme + fonts).
Read docs/PRD-SOW-PHASES.md P1 and docs/PRD-SOW.md visual section.
Init shadcn with: npx shadcn@latest init --preset b27GcrRo --template next --pointer
Add listed primitives, next-themes, Geist + JetBrains Mono, obsidian/cyan tokens, grid+noise, Sonner.
Do not build auth/dashboard/landing features. Mark P1 done in docs/PHASE-STATUS.md and stop.
```

---

# PHASE P2 - Hosted Supabase schema + RLS + seed

## Goal

Hosted Supabase project with migrations in-repo, RLS, profile trigger, and demo seed applied **remotely** (no Docker).

## In scope

- `supabase init` (config + migrations folder only - **do not** use `supabase start`)
- Migration: `profiles`, `metric_points`, `customers` (status includes `archived`; plans Basic/Plus/Premium)
- RLS policies (tenant_id = auth.uid(); profiles id = auth.uid())
- Trigger: on auth user created → insert profile only
- `seed.sql`: demo user `demo@fluxislabs.com` / `fluxis-demo-2026`; ~25 customers (~70/20/10); **90 days** metric_points
- Apply to hosted project **autonomously by the agent** (human does not need to run seed manually). Preferred order:
  1. Supabase MCP (`apply_migration` / `execute_sql`) using project linked to this workspace, or
  2. `supabase link` + `supabase db push` then remote seed execute, or
  3. Direct SQL against hosted project via CLI/service role in `.env.local` (never commit service role)
- Document in `.env.local.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, optional service role for seed scripts; Auth Site URL / redirect notes
- Generate types: `supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts` (or MCP equivalent)
- README/notes: email confirm uses **real inbox** (no Inbucket)

## Out of scope

- Docker, `supabase start`, Inbucket, local Postgres containers
- Next.js auth UI, middleware, dashboard pages
- Waiting for the human to paste SQL into the Dashboard (agent must apply seed themselves)

## Prerequisites from human (if missing, stop and note)

- Hosted Supabase project URL + publishable/anon key already in `.env.local` (or provided)
- Agent has permission to apply migrations + seed via MCP and/or CLI (granted in PRD)

## Done checklist

- [ ] `supabase/migrations/*_init.sql` exists with schema + RLS
- [ ] `supabase/seed.sql` exists with demo user + data
- [ ] Migration + seed **applied by agent** to hosted project (verified with a read query)
- [ ] `types/database.ts` generated from hosted project
- [ ] No Docker/`supabase start` instructions left in phase notes
- [ ] Mark P2 done

## Agent prompt

```text
Implement PulseMetrics PHASE P2 only (hosted Supabase schema + RLS + seed).
Read docs/PRD-SOW-PHASES.md P2 and PRD database section.
NO DOCKER. Do not run supabase start.
Create migrations + seed.sql and APPLY them yourself to the hosted Supabase project (prefer Supabase MCP apply_migration/execute_sql; else link+db push + remote seed).
Do NOT wait for the human to run seed in the Dashboard.
Seed demo@fluxislabs.com / fluxis-demo-2026 (~25 customers, 90 days metrics).
Generate types/database.ts from project-id.
Do not build Next auth UI. Mark P2 done and stop.
```

---

# PHASE P3 - Supabase SSR clients + middleware + env

## Goal

Wire `@supabase/ssr` browser/server clients and session middleware against **hosted** Supabase env vars.

## In scope

- Install `@supabase/supabase-js` and `@supabase/ssr`
- `lib/supabase/client.ts`, `server.ts`, `middleware.ts` helper
- Root `middleware.ts`: refresh session; protect `/dashboard/*` → `/login`; authed `/login|/signup` → `/dashboard`
- Fill `.env.local.example` with hosted project keys (never commit real secrets)
- Create empty placeholder routes for `/login`, `/signup`, `/dashboard` if needed so middleware does not 404 unexpectedly (minimal pages OK)

## Out of scope

- Full auth forms, Google checklist content
- Docker / local Supabase

## Done checklist

- [ ] SSR clients compile against hosted env vars
- [ ] Middleware protects dashboard
- [ ] Env example complete (hosted URL/keys)
- [ ] Mark P3 done

## Agent prompt

```text
Implement PulseMetrics PHASE P3 only (Supabase SSR + middleware + env).
Read docs/PRD-SOW-PHASES.md P3.
Add @supabase/ssr clients under lib/supabase targeting hosted Supabase env vars. Root middleware for session + /dashboard protection.
NO DOCKER / no supabase start. Update .env.local.example. Minimal placeholder pages for login/signup/dashboard OK.
No full auth UI polish. Mark P3 done and stop.
```

---

# PHASE P4 - Auth UI + email/password

## Goal

Working email/password signup/login with confirmation flow against hosted Supabase (real inbox).

## In scope

- Auth layout: centered card, dark gradient
- Pages: `/login`, `/signup`, `/signup/check-email`
- Server Actions: signUp, signIn, signOut
- RHF + Zod schemas in `types/auth.ts`
- Unconfirmed login blocked with clear message
- Confirmed login → `/dashboard`
- Signup → `/signup/check-email`
- Inline errors + Sonner toasts
- Document: confirm email via real inbox; configure Auth Site URL + redirect URLs in hosted Supabase dashboard (README note)

## Out of scope

- Google checklist page (P5), Settings/Account password change (P13)
- Inbucket / Docker

## Done checklist

- [ ] Signup/login/check-email pages work against **hosted** Supabase
- [ ] Demo user can log in (if seed applied)
- [ ] Middleware + actions integrated
- [ ] Mark P4 done

## Agent prompt

```text
Implement PulseMetrics PHASE P4 only (Auth UI + email/password).
Read docs/PRD-SOW-PHASES.md P4 and PRD auth flows.
Build login/signup/check-email with RHF+Zod, Server Actions, email confirm ON, block unconfirmed login, Sonner+inline errors.
Confirm emails via hosted Supabase real inbox (NO Inbucket/Docker).
Do not implement Google setup page (P5). Mark P4 done and stop.
```

---

# PHASE P5 - Google setup page + OAuth callback

## Goal

Google button routes to a setup checklist; callback route prepared for future OAuth.

## In scope

- OAuth buttons on login/signup → `/auth/setup-google`
- `/auth/setup-google` step-by-step Supabase + Google Console checklist
- `/auth/callback` route for code exchange (ready for later credentials)
- Do **not** require live Google credentials

## Out of scope

- Live Google provider configuration in cloud project

## Done checklist

- [ ] Google button visible and routes correctly
- [ ] Checklist page is complete (not a stub)
- [ ] Callback route exists
- [ ] Mark P5 done

## Agent prompt

```text
Implement PulseMetrics PHASE P5 only (Google setup + callback).
Read docs/PRD-SOW-PHASES.md P5.
Add Google button → /auth/setup-google checklist page and auth/callback route.
No live OAuth credentials required. Mark P5 done and stop.
```

---

# PHASE P6 - Dashboard shell

## Goal

Authenticated app chrome: sidebar, topbar, mobile sheet, atmosphere.

## In scope

- `app/dashboard/layout.tsx` shell
- Sidebar groups per PRD (Dashboard / Insights / Customers / Settings / Account)
- Expanded desktop default; mobile sheet drawer
- Topbar: title, theme toggle, global search input (no-op), avatar initials menu
- Cyan grid + noise background on dashboard
- Placeholder pages for overview/analytics/customers/settings/account (empty content OK)

## Out of scope

- Real KPIs, charts, customers table, settings forms

## Done checklist

- [ ] Navigating all dashboard routes works
- [ ] Mobile sheet works
- [ ] Theme toggle works in shell
- [ ] Mark P6 done

## Agent prompt

```text
Implement PulseMetrics PHASE P6 only (dashboard shell).
Read docs/PRD-SOW-PHASES.md P6 and PRD dashboard shell section.
Build sidebar groups, topbar, mobile sheet, atmosphere. Placeholder child pages OK.
No real data features. Mark P6 done and stop.
```

---

# PHASE P7 - Marketing landing

## Goal

Full English marketing landing at `/`.

## In scope

- Sections: Hero, Features, CSS-only mini dashboard preview, Pricing (3 tiers Basic/Plus/Premium), FAQ (10), Testimonials carousel (4-5), `#demo-credentials`, Footer
- Hero CTA scrolls to `#demo-credentials`; secondary Sign up
- Brand: PulseMetrics primary; footer "Built by Fluxis Labs" text only
- Footer: GitHub profile link, Privacy/Terms links (pages may 404 until P8), copyright
- Logo placeholder SVG if asset missing

## Out of scope

- Privacy/Terms page bodies (P8), dashboard features

## Done checklist

- [ ] All landing sections render on desktop + mobile
- [ ] Demo CTA scrolls correctly
- [ ] Mark P7 done

## Agent prompt

```text
Implement PulseMetrics PHASE P7 only (marketing landing).
Read docs/PRD-SOW-PHASES.md P7 and PRD FR-01.
Build full landing with listed sections, demo credentials block, Fluxis footer text only.
Do not implement Privacy/Terms content (P8). Mark P7 done and stop.
```

---

# PHASE P8 - Legal + 404 + SEO/OG

## Goal

Legal stubs, branded 404, full metadata/OG.

## In scope

- `/privacy` and `/terms` Fluxis-branded stubs; contact `fluxislabs@gmail.com`
- `app/not-found.tsx` branded
- Full metadata + OG/Twitter on root and dashboard layouts
- Add/generate `public/og.png` placeholder branded image if missing

## Out of scope

- Real legal counsel copy; feature work

## Done checklist

- [ ] Privacy/Terms render
- [ ] 404 branded
- [ ] OG metadata present; `public/og.png` exists
- [ ] Mark P8 done

## Agent prompt

```text
Implement PulseMetrics PHASE P8 only (legal + 404 + SEO/OG).
Read docs/PRD-SOW-PHASES.md P8.
Add privacy/terms stubs (fluxislabs@gmail.com), branded not-found, full OG metadata, public/og.png placeholder.
Mark P8 done and stop.
```

---

# PHASE P9 - Metrics data layer + Overview

## Goal

`lib/data/metrics` + Overview KPIs and MRR Recharts chart with period switcher.

## In scope

- `lib/data/metrics.ts` (KPIs from latest vs 7 days ago; series by range)
- Overview page: 4 KPI cards (compact EUR); churn inverted colors
- Recharts client island: MRR only; Line default / Bar toggle
- Period switcher 7d/30d/90d; default 7d; URL `?range=`
- Skeleton loaders
- Empty state for users without seed data

## Out of scope

- Analytics 2x2 (P10), customers

## Done checklist

- [x] Demo user sees KPIs + chart for all ranges
- [x] No Supabase calls in Client Components (chart receives props)
- [x] Mark P9 done

## Agent prompt

```text
Implement PulseMetrics PHASE P9 only (metrics data layer + Overview).
Read docs/PRD-SOW-PHASES.md P9 and PRD FR-06.
Build lib/data/metrics.ts, KPI cards, Recharts MRR Line/Bar, ?range= switcher, skeletons, empty state.
No Analytics page yet. Mark P9 done and stop.
```

---

# PHASE P10 - Analytics page

## Goal

`/dashboard/analytics` 2x2 charts sharing `?range=`.

## In scope

- 2x2 grid: MRR cyan, Active Users blue, Churn amber, ARPU green
- Reuse metrics data helpers from P9
- Same period switcher / URL param

## Out of scope

- Customers, settings

## Done checklist

- [x] Analytics renders four charts for demo user
- [x] Range sync with Overview via URL
- [x] Mark P10 done

## Agent prompt

```text
Implement PulseMetrics PHASE P10 only (Analytics 2x2).
Read docs/PRD-SOW-PHASES.md P10 and PRD FR-07.
Reuse metrics helpers; shared ?range=. Mark P10 done and stop.
```

---

# PHASE P11 - Customers table (read path)

## Goal

Server-side customers list with search/filter/pagination (no mutations yet).

## In scope

- `lib/data/customers.ts` list/count (exclude archived)
- Page: columns Name, Email, Company, Status, MRR, Plan, Created (`DD MMM YYYY`)
- URL: `?q=` (name+email, submit on Enter/icon), `?status=`, `?page=` size 20
- Filter select: All/Active/Trial/Cancelled
- Pagination Prev/Next + Page X of Y
- Sort: created_at desc
- Mobile horizontal scroll
- Empty state CTA button can exist but create dialog deferred to P12 (link/button disabled or placeholder OK)

## Out of scope

- Create/Edit/Delete/Bulk (P12)

## Done checklist

- [ ] Demo user sees ~25 customers; filters/search/pagination work
- [ ] Archived excluded from All
- [ ] Mark P11 done

## Agent prompt

```text
Implement PulseMetrics PHASE P11 only (customers read/filter/pagination).
Read docs/PRD-SOW-PHASES.md P11 and PRD FR-08 read parts.
Server-side URL params; no CRUD dialogs yet. Mark P11 done and stop.
```

---

# PHASE P12 - Customers CRUD + bulk

## Goal

Full customer mutations: dialogs, archive-delete, bulk status.

## In scope

- Zod schemas + Server Actions: create, update, archive, bulkStatus
- RHF dialogs; empty create defaults; row click → edit
- `cancelled_at` auto-set/clear on status change
- Delete labeled Delete → archived; AlertDialog with customer name
- Bulk checkbox + status change Active/Trial/Cancelled
- Add customer top-right + mobile FAB
- After mutations: `revalidatePath` + redirect same URL
- Empty state opens create dialog

## Out of scope

- Settings/Account (P13)

## Done checklist

- [x] Create/edit/archive/bulk work for demo tenant
- [x] Archived hidden from lists
- [x] Mark P12 done

## Agent prompt

```text
Implement PulseMetrics PHASE P12 only (customers CRUD + bulk).
Read docs/PRD-SOW-PHASES.md P12 and PRD FR-08 mutation parts.
Dialogs, soft archive, bulk status, FAB, revalidatePath+redirect.
Mark P12 done and stop.
```

---

# PHASE P13 - Settings + Account

## Goal

Profile/settings and account password management.

## In scope

- Settings: company name, full name, theme display; Save + toast
- Account: email read-only, full name edit, change password, sign out
- `lib/data/profile.ts` + Server Actions
- RHF + Zod

## Out of scope

- CI/README (P14)

## Done checklist

- [ ] Settings save persists to profiles
- [ ] Password change works against hosted Supabase
- [ ] Sign out works
- [ ] Mark P13 done

## Agent prompt

```text
Implement PulseMetrics PHASE P13 only (Settings + Account).
Read docs/PRD-SOW-PHASES.md P13 and PRD FR-09/FR-10.
Mark P13 done and stop.
```

---

# PHASE P14 - Playwright + CI + README

## Goal

Verification gates and portfolio documentation.

## In scope

- Playwright config + smoke tests (full e2e against **hosted** Supabase via `.env.local`; CI uses **mock auth**)
- GitHub Actions: lint + build + Playwright (mock auth)
- Portfolio README: setup, hosted Supabase link/`db push`, demo login, real-inbox email confirm, architecture, folder map, stack, portfolio blurb
- Explicit README note: **No Docker required**
- Ensure `npm run lint` and `npm run build` pass
- Update `docs/PHASE-STATUS.md` all done

## Out of scope

- New product features
- Docker / `supabase start` / Inbucket

## Done checklist

- [ ] CI workflow file present
- [ ] Playwright scripts in package.json
- [ ] README complete (hosted Supabase, no Docker)
- [ ] lint + build pass
- [ ] All phases marked done in PHASE-STATUS

## Agent prompt

```text
Implement PulseMetrics PHASE P14 only (Playwright + CI + README).
Read docs/PRD-SOW-PHASES.md P14 and PRD verification section.
Add GHA lint+build+Playwright mock auth; document full e2e against hosted Supabase; portfolio README.
NO DOCKER / no Inbucket. Do not add new product features. Mark all phases done and stop.
```

---

## Handoff template (end of every chat)

Agent should append to `docs/PHASE-STATUS.md`:

```md
### PXX notes
- Completed: <date>
- Key files touched: ...
- Blockers: none | ...
- Next phase: PYY
```

Then **end the chat**. Start a new chat for PYY with that phase's Agent prompt only.

---

## Relationship to other docs

| Doc | Role |
|---|---|
| [`docs/PRD-SOW.md`](PRD-SOW.md) | Full product requirements + acceptance (canonical product truth) |
| [`docs/PRD-SOW-PHASES.md`](PRD-SOW-PHASES.md) | This file - execution slices for agents |
| Cursor plan `pulsemetrics_saas_scaffold_0024a82c` | Engineering architecture plan |
| `docs/PHASE-STATUS.md` | Live progress tracker (created in P0) |
