-- Iboren booking numbers
-- Step BookingNumber-1
-- Run this once in Supabase SQL Editor before enabling booking_number generation in API routes.
-- This is intentionally backward-compatible:
-- - Existing UUID id columns stay unchanged.
-- - Existing rows can keep booking_number as null.
-- - Unique indexes only apply when booking_number is not null.

alter table public.bookings
  add column if not exists booking_number text;

alter table public.public_booking_requests
  add column if not exists booking_number text;

create unique index if not exists bookings_booking_number_unique_idx
  on public.bookings (booking_number)
  where booking_number is not null;

create unique index if not exists public_booking_requests_booking_number_unique_idx
  on public.public_booking_requests (booking_number)
  where booking_number is not null;

create table if not exists public.booking_number_counters (
  day_key text primary key,
  last_sequence integer not null default 0 check (last_sequence >= 0),
  updated_at timestamptz not null default now()
);

alter table public.booking_number_counters enable row level security;

create or replace function public.next_iboren_booking_sequence(p_day_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_sequence integer;
begin
  if p_day_key is null or trim(p_day_key) = '' then
    raise exception 'day_key is required';
  end if;

  insert into public.booking_number_counters as counter (day_key, last_sequence, updated_at)
  values (p_day_key, 1, now())
  on conflict (day_key)
  do update set
    last_sequence = counter.last_sequence + 1,
    updated_at = now()
  returning last_sequence into next_sequence;

  return next_sequence;
end;
$$;

revoke all on function public.next_iboren_booking_sequence(text) from public;
revoke all on function public.next_iboren_booking_sequence(text) from anon;
revoke all on function public.next_iboren_booking_sequence(text) from authenticated;
grant execute on function public.next_iboren_booking_sequence(text) to service_role;

-- Optional manual checks after running:
-- select public.next_iboren_booking_sequence('260601');
-- select * from public.booking_number_counters order by updated_at desc;