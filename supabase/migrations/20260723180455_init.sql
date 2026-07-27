-- PulseMetrics initial schema: profiles, metric_points, customers + RLS + profile trigger
-- Tenancy: user-as-tenant (tenant_id = auth.uid())

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.customer_status as enum ('active', 'trial', 'cancelled', 'archived');
create type public.plan_name as enum ('Basic', 'Plus', 'Premium');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

-- ---------------------------------------------------------------------------
-- metric_points (daily series per tenant)
-- ---------------------------------------------------------------------------
create table public.metric_points (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  mrr numeric(12, 2) not null default 0,
  active_users integer not null default 0,
  churn_rate numeric(6, 4) not null default 0,
  arpu numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint metric_points_tenant_date_unique unique (tenant_id, date)
);

create index metric_points_tenant_date_idx on public.metric_points (tenant_id, date desc);

-- ---------------------------------------------------------------------------
-- customers (tenant-scoped CRM)
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  status public.customer_status not null default 'trial',
  mrr numeric(12, 2) not null default 0,
  plan_name public.plan_name not null default 'Basic',
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_tenant_created_idx on public.customers (tenant_id, created_at desc);
create index customers_tenant_status_idx on public.customers (tenant_id, status);
create index customers_tenant_email_idx on public.customers (tenant_id, email);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth → profile trigger (profile only; no auto-seed of metrics/customers)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, company_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.metric_points enable row level security;
alter table public.customers enable row level security;

-- profiles: own row only
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- metric_points: tenant isolation
create policy "metric_points_select_own"
  on public.metric_points for select
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "metric_points_insert_own"
  on public.metric_points for insert
  to authenticated
  with check (tenant_id = (select auth.uid()));

create policy "metric_points_update_own"
  on public.metric_points for update
  to authenticated
  using (tenant_id = (select auth.uid()))
  with check (tenant_id = (select auth.uid()));

create policy "metric_points_delete_own"
  on public.metric_points for delete
  to authenticated
  using (tenant_id = (select auth.uid()));

-- customers: tenant isolation
create policy "customers_select_own"
  on public.customers for select
  to authenticated
  using (tenant_id = (select auth.uid()));

create policy "customers_insert_own"
  on public.customers for insert
  to authenticated
  with check (tenant_id = (select auth.uid()));

create policy "customers_update_own"
  on public.customers for update
  to authenticated
  using (tenant_id = (select auth.uid()))
  with check (tenant_id = (select auth.uid()));

create policy "customers_delete_own"
  on public.customers for delete
  to authenticated
  using (tenant_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select, insert, update, delete on public.metric_points to authenticated;
grant select, insert, update, delete on public.customers to authenticated;

grant all on public.profiles to service_role;
grant all on public.metric_points to service_role;
grant all on public.customers to service_role;

grant usage on type public.customer_status to authenticated, service_role;
grant usage on type public.plan_name to authenticated, service_role;
