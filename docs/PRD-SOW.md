# PulseMetrics - Product Requirements Document & Statement of Work

| Field | Value |
|---|---|
| **Document type** | PRD + SoW (combined) |
| **Product** | PulseMetrics |
| **Client / Studio** | Fluxis Labs |
| **Repo** | `pulse-metrics` |
| **Version** | 1.0 |
| **Status** | Approved for implementation |
| **Date** | 18 Jul 2026 |
| **Owner** | Marko Vuchko ([Marko-Vuchko](https://github.com/Marko-Vuchko)) |
| **Contact** | fluxislabs@gmail.com |

---

## 1. Purpose and intent

### 1.1 Primary intent

Design and scaffold a **high-performance, premium SaaS Analytics Dashboard** named **PulseMetrics**, aimed at indie hackers and small businesses, driven entirely by **simulated (mock) data** stored in Supabase Postgres.

### 1.2 Why this exists

This application is a **prime portfolio asset for Fluxis Labs**. It must visually and technically demonstrate master-level proficiency in:

- Next.js (App Router)
- Supabase (Auth and Database with RLS)
- Interactive data visualization
- Professional CRUD / filter architecture

…to potential international clients, **without** live payment gateways or billing integrations.

### 1.3 Success definition

A production-ready, portfolio-demoable SaaS shell where:

1. A seeded demo user can log in and see KPIs, charts, and customers.
2. Auth, tenancy (RLS), and clean architecture are real - not stubs.
3. The UI reads as a dark-first, cyber-minimal Fluxis product.
4. New signups work (email confirm) and see intentional empty states.
5. Lint, build, and Playwright smoke pass.

---

## 2. Scope of work (SoW)

### 2.1 In scope

| Workstream | Deliverable |
|---|---|
| **Foundation** | Next.js 16 App Router project (existing scaffold) + TypeScript + Tailwind v4 |
| **UI kit** | shadcn/ui (`npx shadcn@latest init --preset b27GcrRo --template next --pointer`) |
| **Auth** | Email/Password (full); Google OAuth UI + setup checklist (not live credentials required) |
| **Database** | Hosted Supabase project (cloud); migrations in repo; RLS; SQL seed applied remotely |
| **Dashboard** | Overview, Analytics, Customers (full CRUD), Settings, Account |
| **Marketing** | Full landing page + Privacy/Terms stubs |
| **Charts** | Recharts (Line/Bar) from seeded `metric_points` |
| **QA** | ESLint, production build, Playwright e2e, GitHub Actions CI |
| **Docs** | Portfolio-depth README |

### 2.2 Out of scope (hard exclusions)

- Live payment integrations (Stripe, Lemon Squeezy, etc.)
- Webhooks or real financial transactions
- Local mock generators as the **source of truth** for analytics (DB seed only)
- Direct database queries inside React Client Components
- Heavy 3D libraries (Three.js, Spline)
- Generic placeholder stubs (`// TODO: implement later`)
- Multi-workspace / team invites (user-as-tenant only for v1)
- Restore UI for archived customers (v1)
- Live Google OAuth credentials wiring (callback + checklist only)
- Docker / local Supabase stack (`supabase start`, Inbucket, local Postgres containers)

### 2.3 Implementation phases (ordered)

1. **Supabase + Auth** - hosted project link, schema push, remote seed, SSR clients, middleware, email/password, check-email (confirm via real inbox)
2. **shadcn + theme** - preset, tokens, fonts, atmosphere, Sonner
3. **Dashboard shell + landing** - layout, marketing, legal, metadata, 404
4. **Features** - Overview, Analytics, Customers CRUD, Settings, Account, Google setup page
5. **Verify** - lint, build, Playwright, GitHub Actions, README

---

## 3. Stakeholders and users

| Role | Description |
|---|---|
| **Portfolio visitor** | International client / recruiter viewing landing + demo |
| **Demo user** | Seeded account with full analytics dataset |
| **New signup** | Real auth user; empty metrics/customers until they CRUD |
| **Fluxis Labs** | Studio brand; footer attribution; legal contact |

---

## 4. Product requirements

### 4.1 Functional requirements

#### FR-01 - Marketing landing (`/`)

- Full marketing page (not minimal hero-only).
- Sections (in order of product design):
  1. Hero (PulseMetrics brand primary)
  2. Features
  3. CSS-only mini dashboard preview (fake inline visual, not live DB)
  4. Pricing-style tiers (3: Basic / Plus / Premium) - **no checkout**
  5. FAQ accordion - **10 items**
  6. Testimonials carousel - **4-5 mock quotes**
  7. Demo credentials section (`#demo-credentials`)
  8. Footer
- Hero primary CTA: **"View demo dashboard"** scrolls to `#demo-credentials`.
- Secondary CTA: Sign up.
- Brand rule: **PulseMetrics** dominates first viewport; Fluxis Labs only in footer as text **"Built by Fluxis Labs"** (no website URL).
- Footer links: GitHub profile `https://github.com/Marko-Vuchko`, Privacy, Terms, copyright.
- Language: **English only**.
- Logo: user-supplied asset when available; cyan pulse SVG placeholder until then.

#### FR-02 - Legal pages

- `/privacy` and `/terms` - Fluxis-branded legal stubs.
- Contact email: **fluxislabs@gmail.com**.

#### FR-03 - Authentication

| Flow | Requirement |
|---|---|
| Signup | Email + password; email confirmation **ON**; redirect to `/signup/check-email` |
| Unconfirmed login | **Blocked** with message to confirm email first |
| Confirmed login | Redirect to `/dashboard` |
| Logout | Server Action; redirect `/login` |
| Password rules | Supabase default (min 6 characters) |
| Google | Visible button → `/auth/setup-google` step-by-step checklist (Supabase + Google Console); OAuth callback route prepared |
| Email confirmation testing | Confirm via **real inbox** email from hosted Supabase Auth; document Site URL / redirect URLs in README |
| Auth layout | Centered card on dark gradient |
| Forms | react-hook-form + zodResolver + shared Zod schemas; Server Actions re-validate |
| Feedback | Inline field errors + Sonner toast |

#### FR-04 - Route protection

- Middleware refreshes session.
- Unauthenticated access to `/dashboard/*` → `/login`.
- Authenticated users on `/login` or `/signup` → `/dashboard`.
- Custom branded `not-found.tsx`.
- No demo-login bypass route.

#### FR-05 - Dashboard shell

- Sidebar groups:
  - **Dashboard** → Overview
  - **Insights** → Analytics
  - **Customers** (standalone)
  - **Settings**
  - **Account**
- Desktop: sidebar **expanded** by default.
- Mobile: **sheet drawer** (hamburger).
- Topbar: page title, theme toggle, global search input (**no-op v1**), user menu with initials avatar.
- Background: subtle cyan grid + fine noise texture.
- Theme: dark-first; respects system preference (`next-themes`).

#### FR-06 - Overview (`/dashboard`)

- Four KPI cards: **MRR**, **Active Users**, **Churn Rate**, **ARPU**.
- KPI grid: 4 columns desktop / 2 tablet / 1 mobile.
- Number format: **compact** (e.g. €12.4k); currency **EUR**; en-US grouping.
- Trend comparison: vs **7 days ago**.
- Trend colors: green = positive, red = negative; **churn inverted** (decrease = green).
- Chart: **MRR only**; Recharts; **Line** default / **Bar** toggle.
- Period switcher: **7d / 30d / 90d**; default **7d**; URL `?range=7d|30d|90d`.

#### FR-07 - Analytics (`/dashboard/analytics`)

- 2×2 chart grid.
- Charts: MRR (cyan), Active Users (blue), Churn (amber), ARPU (green).
- Shares same `?range=` URL param as Overview.

#### FR-08 - Customers (`/dashboard/customers`)

- Server-side table driven by URL searchParams: `?q=&status=&page=&range=` (range not required on this page but naming convention shared).
- Search (`q`): **name + email**; submit on **Enter** or search icon (not debounce-on-type).
- Status filter UI: select dropdown - All / Active / Trial / Cancelled.
- **"All"** = active + trial + cancelled (**excludes archived**).
- Page size: **20**.
- Pagination UI: Prev / Next + "Page X of Y".
- Default sort: `created_at desc` (fixed; not in URL).
- Columns: Name, Email, Company, Status, MRR, Plan, Created (`DD MMM YYYY`).
- Mobile: horizontal scroll table.
- **Full CRUD** via Dialog modals.
- Create form: **empty defaults** (user fills all); fields include name, email, company, status, mrr, plan_name; `cancelled_at` when status = cancelled (auto-set/clear on status change).
- MRR validation: `>= 0`, max 2 decimals, EUR.
- Row click opens Edit dialog.
- Delete UI labeled **"Delete"** → soft archive (`status = 'archived'`); AlertDialog includes customer name.
- Bulk actions: checkbox select + bulk status change to Active / Trial / Cancelled (**no archive in bulk**).
- CTA: "Add customer" top-right + FAB on mobile.
- Empty state: "Add first customer".
- After mutations: `revalidatePath` + redirect to same URL.

#### FR-09 - Settings (`/dashboard/settings`)

- Editable: company name, full name; theme preference display.
- Save button + Sonner toast on success.

#### FR-10 - Account (`/dashboard/account`)

- Email read-only.
- Full name edit.
- Change password form.
- Sign out.

#### FR-11 - Demo credentials

| Field | Value |
|---|---|
| Email | `demo@fluxislabs.com` |
| Password | `fluxis-demo-2026` |
| Documented in | `seed.sql`, README, `.env.local.example` comments |

---

### 4.2 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Clean architecture: UI / forms / data access / Supabase clients separated |
| NFR-02 | No business DB queries in Client Components |
| NFR-03 | RLS tenant isolation on all business tables (`tenant_id = auth.uid()`) |
| NFR-04 | TypeScript throughout; generated DB types via `supabase gen types typescript --project-id <id>` (never `--local`) |
| NFR-05 | Zod schemas shared between client forms and Server Actions |
| NFR-06 | Premium cyber-minimal aesthetic; Lighthouse-conscious (no heavy 3D) |
| NFR-07 | Responsive: desktop and mobile |
| NFR-08 | Loading: skeleton loaders on KPI / chart / table |
| NFR-09 | Errors: route-level `error.tsx` + section-level retry cards |
| NFR-10 | SEO: full metadata + OG/Twitter on landing and dashboard layouts; static `public/og.jpg` |
| NFR-11 | English UI copy only |

---

## 5. Technical architecture

### 5.1 Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.2.10** (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn preset **b27GcrRo** |
| Charts | **Recharts** |
| Auth / DB | Hosted Supabase (cloud project); CLI used only for `link` / `db push` / `gen types` (no Docker) |
| SSR auth | `@supabase/ssr` |
| Forms | react-hook-form + zodResolver + Zod |
| Toasts | Sonner |
| Theme | next-themes |
| Fonts | Geist (body/heading) + JetBrains Mono (accent) |
| E2E | Playwright |
| CI | GitHub Actions |

### 5.2 Hosted Supabase workflow (no Docker)

1. Create/link a Supabase cloud project.
2. Keep SQL in `supabase/migrations/` and `supabase/seed.sql` in the repo.
3. **Agent applies migrations and seed autonomously** in P2 (prefer Supabase MCP `apply_migration` / `execute_sql`; else `supabase link` + `db push` + remote seed). Human does **not** need to paste SQL into the Dashboard.
4. Put `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.
5. Generate types with `--project-id` (not `--local`).
6. Email confirmation: real inbox emails from Supabase Auth (configure Site URL + redirect URLs).

### 5.3 Folder architecture (classic layers)

```
app/                 # routes, layouts, Server Actions
components/          # ui, layout, marketing, dashboard, customers, auth
lib/supabase/        # client construction only
lib/data/            # all business DB reads/writes helpers
types/               # database.ts (generated) + Zod schemas
supabase/            # config.toml, migrations, seed.sql
middleware.ts
```

### 5.4 Data flow

```
Browser UI
  → Server Components / Server Actions
    → lib/data/*
      → lib/supabase (server client)
        → Hosted Postgres (RLS)
```

Seeded mock analytics live **only** in Postgres (`metric_points`, `customers`). Landing CSS preview may use static inline fake visuals (not a second analytics source of truth).

### 5.5 Database schema

**Tables**

1. `profiles` - 1:1 with `auth.users` (id, email, full_name, company_name, avatar_url, timestamps)
2. `metric_points` - daily series (tenant_id, date, mrr, active_users, churn_rate, arpu); unique (tenant_id, date)
3. `customers` - tenant-scoped CRM rows; status ∈ `active | trial | cancelled | archived`; plan_name ∈ `Basic | Plus | Premium`

**Tenancy model:** user-as-tenant (`tenant_id = auth.uid()`).

**Triggers:** on auth user created → insert profile only (no auto-seed of metrics/customers).

**Seed volume**

- ~25 customers (~70% active / 20% trial / 10% cancelled)
- **90 days** of metric_points
- Demo user as above

---

## 6. Visual design system

| Token | Spec |
|---|---|
| Direction | Dark-first, cyber-minimal, Fluxis aesthetic |
| Surfaces | Obsidian / near-black |
| Accent | Electric cyan |
| Accent usage | Primary buttons, active nav, chart primary, positive KPI, focus rings |
| Atmosphere | Subtle cyan grid overlay + fine noise (CSS/SVG only) |
| Trend colors | Green positive / red negative (churn inverted) |
| Chart colors | MRR cyan, Users blue, Churn amber, ARPU green |
| Motion | Light transitions (sidebar, KPI enter, chart toggle); respect `prefers-reduced-motion` |

---

## 7. Acceptance criteria

### 7.1 Functional acceptance

- [ ] Landing renders all required sections; demo CTA scrolls to `#demo-credentials`
- [ ] Signup → check-email; confirm link arrives in real inbox; unconfirmed login blocked
- [ ] Demo login shows KPIs, MRR chart (Line/Bar), period ranges 7/30/90
- [ ] Analytics shows 2×2 charts with shared `?range=`
- [ ] Customers: search, filter, pagination, create, edit, archive-delete, bulk status
- [ ] Archived rows hidden from All/Active/Trial/Cancelled
- [ ] Settings save works; Account password change + sign out work
- [ ] Google button opens setup checklist (does not require live OAuth)
- [ ] Middleware protects `/dashboard/*`
- [ ] Privacy/Terms pages exist with Fluxis contact email
- [ ] Dark/light theme toggle works; mobile nav usable

### 7.2 Quality gates

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Playwright smoke against hosted Supabase (dev) and in CI (mock auth)
- [ ] GitHub Actions: lint + build + Playwright (mock auth)
- [ ] README: setup, hosted Supabase link, demo login, email confirm flow, architecture, folder map, portfolio blurb

### 7.3 Playwright scope (hosted Supabase for full e2e)

- Login demo user + dashboard KPIs visible
- Customers filter / search smoke
- Create / edit / delete (archive) customer flow
- Landing CTA navigation
- Theme toggle

CI uses **mock auth** (no Supabase service container in GitHub Actions).

---

## 8. Deliverables checklist

| # | Deliverable | Location / notes |
|---|---|---|
| 1 | Running Next.js app with App Router | repo root |
| 2 | shadcn UI + theme tokens | `components/ui`, `app/globals.css` |
| 3 | Supabase migrations + seed | `supabase/` |
| 4 | Auth + middleware | `app/(auth)`, `middleware.ts`, `app/actions/auth.ts` |
| 5 | Dashboard pages | `app/dashboard/*` |
| 6 | Marketing + legal | `app/page.tsx`, `app/privacy`, `app/terms` |
| 7 | Typed data layer | `lib/data/*`, `types/*` |
| 8 | Playwright + CI | `playwright.config.ts`, `.github/workflows/ci.yml` |
| 9 | Portfolio README | `README.md` |
| 10 | Env example | `.env.local.example` |
| 11 | OG image | `public/og.jpg` (static branded; final asset in `public/brand/`) |
| 12 | This PRD/SoW | `docs/PRD-SOW.md` |

---

## 9. Assumptions and dependencies

1. A **hosted Supabase project** exists with URL + publishable key in `.env.local`. **No Docker.**
2. In **P2**, the agent **must apply migrations and seed themselves** (MCP and/or CLI) - do not wait for the human to run SQL in the Dashboard.
3. Logo assets live in `public/brand/` (`logo-mark.svg`, `logo.svg`); `Logo` component consumes the mark.
4. `public/og.jpg` is the branded Open Graph / Twitter card image (1200x630).
5. Google OAuth production credentials are **not** required for v1 acceptance.
6. New signups intentionally see empty analytics until they create customers (metrics remain empty without seed - documented).
7. Next.js docs under `node_modules/next/dist/docs/` must be consulted for App Router APIs (project AGENTS.md rule).
8. Email confirmation uses Supabase hosted Auth emails (real inbox), not Inbucket.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Empty dashboards for new users | Empty states + landing demo credentials |
| Email confirmation friction without Inbucket | `/signup/check-email` + README for inbox/spam; Site URL config in Supabase Auth |
| Google not fully wired | Setup checklist page; email/password is primary |
| Soft-delete confusion (Delete → archived) | AlertDialog copy; README note; no restore in v1 |
| CI cannot run hosted Supabase secrets easily | Mock auth Playwright in GHA; full e2e against hosted project locally with `.env.local` |
| User-as-tenant blocks future teams | Accepted for v1; schema can evolve to workspaces |
| Recharts bundle size | Dynamic import chart client island; keep pages RSC |
| Accidental Docker assumption | Explicitly out of scope; agents must not require `supabase start` |

---

## 11. Decision log (summary of discovery)

Discovery was conducted across **7 Q&A rounds (~110 decisions)**. High-level locked choices:

| Area | Decision |
|---|---|
| Mock data | Supabase seed only |
| Depth | Full multi-page MVP + marketing landing |
| Auth | Email/password full; Google checklist UI |
| Charts | Recharts; Overview MRR Line/Bar; Analytics 2×2 |
| Customers | Server-side filters; full CRUD; soft archive |
| Tenancy | User-as-tenant |
| Seed | SQL seed; 90 days metrics; ~25 customers; **P2 agent applies seed autonomously** |
| Visual | Obsidian + electric cyan; Geist + JetBrains Mono |
| Runtime | Hosted Supabase cloud (no Docker) |
| Docker | **Removed (23 Jul 2026)** - no `supabase start` / Inbucket |
| Architecture | Classic layers (`app/`, `components/`, `lib/`, `types/`) |
| Forms | RHF + Zod |
| Currency | EUR |
| Language | English |
| CI | lint + build + Playwright mock auth |
| Footer Fluxis | Text only (no website link) |

Full engineering plan: Cursor plan `pulsemetrics_saas_scaffold_0024a82c.plan.md`.  
Phased agent pack: [`docs/PRD-SOW-PHASES.md`](PRD-SOW-PHASES.md).

---

## 12. Approval

| Role | Name | Status |
|---|---|---|
| Product / Studio | Fluxis Labs (Marko Vuchko) | Decisions locked via Q&A + plan update |
| Engineering | Implementation pending explicit execute approval | Pending |

**Next step:** Open a new chat per phase in [`docs/PRD-SOW-PHASES.md`](PRD-SOW-PHASES.md) starting at **P0**. For P2: agent applies schema + seed autonomously (no human Dashboard step).
