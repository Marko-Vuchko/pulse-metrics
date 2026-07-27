-- Cover team_invites.invited_by FK (Supabase performance advisor)
create index if not exists team_invites_invited_by_idx
  on public.team_invites (invited_by);
