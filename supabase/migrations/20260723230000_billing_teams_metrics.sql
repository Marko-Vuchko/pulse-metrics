-- Product layer: billing plan on profiles, team invites, (metrics ingest uses existing metric_points)

-- ---------------------------------------------------------------------------
-- profiles.billing_plan (showcase subscription; no Stripe)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists billing_plan public.plan_name not null default 'Basic';

-- ---------------------------------------------------------------------------
-- Team invites (schema evolution beyond pure user-as-tenant UI)
-- Shared workspace access still uses owner tenant_id; invites are owner-scoped.
-- ---------------------------------------------------------------------------
create type public.team_invite_status as enum ('pending', 'accepted', 'revoked');
create type public.team_member_role as enum ('admin', 'member', 'viewer');

create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  role public.team_member_role not null default 'member',
  status public.team_invite_status not null default 'pending',
  invited_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_invites_email_format check (position('@' in email) > 1)
);

create index team_invites_tenant_created_idx
  on public.team_invites (tenant_id, created_at desc);

create index team_invites_tenant_status_idx
  on public.team_invites (tenant_id, status);

-- One pending invite per email per workspace
create unique index team_invites_tenant_email_pending_uidx
  on public.team_invites (tenant_id, lower(email))
  where status = 'pending';

create trigger team_invites_set_updated_at
  before update on public.team_invites
  for each row execute function public.set_updated_at();

alter table public.team_invites enable row level security;

create policy "team_invites_select_own"
  on public.team_invites for select
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "team_invites_insert_own"
  on public.team_invites for insert
  to authenticated
  with check (
    tenant_id = (select auth.uid())
    and invited_by = (select auth.uid())
  );

create policy "team_invites_update_own"
  on public.team_invites for update
  to authenticated
  using (tenant_id = (select auth.uid()))
  with check (tenant_id = (select auth.uid()));

create policy "team_invites_delete_own"
  on public.team_invites for delete
  to authenticated
  using (tenant_id = (select auth.uid()));

grant select, insert, update, delete on public.team_invites to authenticated;
grant all on public.team_invites to service_role;
