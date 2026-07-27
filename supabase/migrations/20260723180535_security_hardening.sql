-- Harden trigger helpers per Supabase advisors
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.handle_new_user() to postgres, service_role;
grant execute on function public.set_updated_at() to postgres, service_role;
