create table if not exists public.rate_limits (
  key text primary key,
  route text not null,
  count integer not null default 1 check (count >= 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists rate_limits_route_reset_at_idx
  on public.rate_limits (route, reset_at);

alter table public.rate_limits enable row level security;

-- This table is only for trusted server-side route handlers using the Supabase service role.
-- Do not add anon/authenticated select/insert/update policies for public clients.

create or replace function public.cleanup_expired_rate_limits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where reset_at < now() - interval '1 day';
$$;

revoke all on function public.cleanup_expired_rate_limits() from public;
