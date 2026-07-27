-- Real customer activity events + tenant notifications (hero loop depth)
-- Tenancy: user-as-tenant (tenant_id = auth.uid())

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.customer_activity_kind as enum (
  'created',
  'plan',
  'status',
  'mrr',
  'note',
  'cancelled'
);

create type public.notification_severity as enum ('info', 'warning', 'success');

-- ---------------------------------------------------------------------------
-- customer_activity_events
-- ---------------------------------------------------------------------------
create table public.customer_activity_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  kind public.customer_activity_kind not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index customer_activity_events_customer_created_idx
  on public.customer_activity_events (customer_id, created_at desc);

create index customer_activity_events_tenant_created_idx
  on public.customer_activity_events (tenant_id, created_at desc);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  severity public.notification_severity not null default 'info',
  href text not null default '/dashboard',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_tenant_created_idx
  on public.notifications (tenant_id, created_at desc);

create index notifications_tenant_unread_idx
  on public.notifications (tenant_id, created_at desc)
  where read_at is null;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.customer_activity_events enable row level security;
alter table public.notifications enable row level security;

create policy "customer_activity_events_select_own"
  on public.customer_activity_events for select
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "customer_activity_events_insert_own"
  on public.customer_activity_events for insert
  to authenticated
  with check (tenant_id = (select auth.uid()));

create policy "customer_activity_events_delete_own"
  on public.customer_activity_events for delete
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "notifications_insert_own"
  on public.notifications for insert
  to authenticated
  with check (tenant_id = (select auth.uid()));

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (tenant_id = (select auth.uid()))
  with check (tenant_id = (select auth.uid()));

create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (tenant_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant select, insert, delete on public.customer_activity_events to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

grant all on public.customer_activity_events to service_role;
grant all on public.notifications to service_role;

grant usage on type public.customer_activity_kind to authenticated, service_role;
grant usage on type public.notification_severity to authenticated, service_role;
