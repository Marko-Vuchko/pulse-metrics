-- PulseMetrics demo seed (hosted Supabase)
-- Demo login: demo@fluxislabs.com / fluxis-demo-2026
-- Email confirmation uses a real inbox on hosted Auth (no Inbucket / no local Docker).
-- Applied remotely via MCP execute_sql or supabase db push + remote seed.

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  demo_id uuid := 'a0000000-0000-4000-8000-000000000001';
  demo_email text := 'demo@fluxislabs.com';
  demo_password text := 'fluxis-demo-2026';
begin
  -- Idempotent: remove prior demo tenant data if re-seeding
  delete from public.customers where tenant_id = demo_id;
  delete from public.metric_points where tenant_id = demo_id;
  delete from auth.identities where user_id = demo_id;
  delete from auth.users where id = demo_id;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    demo_id,
    'authenticated',
    'authenticated',
    demo_email,
    extensions.crypt(demo_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object(
      'full_name', 'Demo User',
      'company_name', 'Fluxis Labs'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    demo_id,
    jsonb_build_object(
      'sub', demo_id::text,
      'email', demo_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    demo_id::text,
    now(),
    now(),
    now()
  );

  -- Trigger creates profiles row; ensure demo profile fields are set
  update public.profiles
  set
    email = demo_email,
    full_name = 'Demo User',
    company_name = 'Fluxis Labs',
    updated_at = now()
  where id = demo_id;

  -- ~25 customers: ~70% active (18), ~20% trial (5), ~10% cancelled (2)
  insert into public.customers (
    tenant_id, name, email, company, status, mrr, plan_name, cancelled_at, created_at
  ) values
    (demo_id, 'Acme Robotics', 'ops@acmerobotics.io', 'Acme Robotics', 'active', 890.00, 'Premium', null, now() - interval '118 days'),
    (demo_id, 'Northwind Analytics', 'billing@northwind.example', 'Northwind Analytics', 'active', 420.00, 'Plus', null, now() - interval '110 days'),
    (demo_id, 'Brightleaf Health', 'finance@brightleaf.health', 'Brightleaf Health', 'active', 310.00, 'Plus', null, now() - interval '102 days'),
    (demo_id, 'Cedar Systems', 'hello@cedarsystems.dev', 'Cedar Systems', 'active', 149.00, 'Basic', null, now() - interval '95 days'),
    (demo_id, 'Orbit Freight', 'accounts@orbitfreight.com', 'Orbit Freight', 'active', 640.00, 'Premium', null, now() - interval '88 days'),
    (demo_id, 'Lumen Studio', 'team@lumenstudio.co', 'Lumen Studio', 'active', 199.00, 'Basic', null, now() - interval '81 days'),
    (demo_id, 'Harbor CRM', 'admin@harborcrm.app', 'Harbor CRM', 'active', 520.00, 'Plus', null, now() - interval '74 days'),
    (demo_id, 'PixelForge', 'founders@pixelforge.io', 'PixelForge', 'active', 275.00, 'Plus', null, now() - interval '67 days'),
    (demo_id, 'Summit Legal', 'it@summitlegal.com', 'Summit Legal', 'active', 780.00, 'Premium', null, now() - interval '60 days'),
    (demo_id, 'Riverbank Fintech', 'ops@riverbank.fin', 'Riverbank Fintech', 'active', 450.00, 'Plus', null, now() - interval '53 days'),
    (demo_id, 'Cascade Foods', 'growth@cascadefoods.com', 'Cascade Foods', 'active', 165.00, 'Basic', null, now() - interval '46 days'),
    (demo_id, 'Nova Retail', 'data@novaretail.shop', 'Nova Retail', 'active', 990.00, 'Premium', null, now() - interval '39 days'),
    (demo_id, 'Atlas Mobility', 'fleet@atlasmobility.io', 'Atlas Mobility', 'active', 360.00, 'Plus', null, now() - interval '32 days'),
    (demo_id, 'Quiet Labs', 'hi@quietlabs.dev', 'Quiet Labs', 'active', 129.00, 'Basic', null, now() - interval '28 days'),
    (demo_id, 'Ember Media', 'billing@embermedia.tv', 'Ember Media', 'active', 410.00, 'Plus', null, now() - interval '24 days'),
    (demo_id, 'Falcon Security', 'ops@falconsec.io', 'Falcon Security', 'active', 720.00, 'Premium', null, now() - interval '19 days'),
    (demo_id, 'Meadow Soft', 'hello@meadowsoft.com', 'Meadow Soft', 'active', 185.00, 'Basic', null, now() - interval '14 days'),
    (demo_id, 'Copperline', 'finance@copperline.co', 'Copperline', 'active', 295.00, 'Plus', null, now() - interval '9 days'),
    (demo_id, 'Trailhead Apps', 'trial@trailhead.apps', 'Trailhead Apps', 'trial', 0.00, 'Basic', null, now() - interval '21 days'),
    (demo_id, 'Kinetic Design', 'trial@kinetic.design', 'Kinetic Design', 'trial', 0.00, 'Plus', null, now() - interval '16 days'),
    (demo_id, 'Bluepine AI', 'hello@bluepine.ai', 'Bluepine AI', 'trial', 0.00, 'Premium', null, now() - interval '11 days'),
    (demo_id, 'Shelfwise', 'start@shelfwise.app', 'Shelfwise', 'trial', 0.00, 'Basic', null, now() - interval '6 days'),
    (demo_id, 'Driftwood Co', 'team@driftwood.co', 'Driftwood Co', 'trial', 0.00, 'Plus', null, now() - interval '3 days'),
    (demo_id, 'Former Cloud', 'bye@formercloud.io', 'Former Cloud', 'cancelled', 0.00, 'Plus', now() - interval '40 days', now() - interval '130 days'),
    (demo_id, 'Sunset Tools', 'closed@sunsettools.com', 'Sunset Tools', 'cancelled', 0.00, 'Basic', now() - interval '18 days', now() - interval '75 days');

  -- 90 days of metric_points with gentle upward MRR / users trend
  insert into public.metric_points (tenant_id, date, mrr, active_users, churn_rate, arpu)
  select
    demo_id,
    d::date,
    round((6200 + (i * 28) + (sin(i / 7.0) * 120))::numeric, 2) as mrr,
    (840 + (i * 3) + ((i % 5) * 2))::integer as active_users,
    round((0.028 - (i * 0.00008) + (sin(i / 11.0) * 0.004))::numeric, 4) as churn_rate,
    round(
      (
        (6200 + (i * 28) + (sin(i / 7.0) * 120))
        / greatest(840 + (i * 3) + ((i % 5) * 2), 1)
      )::numeric,
      2
    ) as arpu
  from generate_series(
    (current_date - interval '89 days')::date,
    current_date,
    interval '1 day'
  ) with ordinality as g(d, i);

  -- Activity + notifications for the hero product loop
  insert into public.customer_activity_events (
    tenant_id, customer_id, kind, title, description, created_at
  )
  select
    demo_id,
    c.id,
    'created',
    'Customer created',
    c.name || ' added to the roster.',
    c.created_at
  from public.customers c
  where c.tenant_id = demo_id;

  insert into public.notifications (
    tenant_id, title, description, severity, href, created_at, read_at
  )
  values
    (
      demo_id,
      'Churn watch',
      '7-day churn rose vs the prior window. Review at-risk accounts.',
      'warning',
      '/dashboard/analytics',
      now() - interval '2 hours',
      null
    ),
    (
      demo_id,
      'MRR climbing',
      'Monthly recurring revenue climbed over the last 7 days.',
      'success',
      '/dashboard',
      now() - interval '5 hours',
      null
    ),
    (
      demo_id,
      'Trials ending soon',
      'Follow up before trial windows expire this week.',
      'info',
      '/dashboard/customers?status=trial',
      now() - interval '26 hours',
      now() - interval '1 day'
    ),
    (
      demo_id,
      'Workspace ready',
      'Demo tenant is seeded with customers and metric days.',
      'info',
      '/dashboard/customers',
      now() - interval '2 days',
      now() - interval '1 day'
    );
end $$;
