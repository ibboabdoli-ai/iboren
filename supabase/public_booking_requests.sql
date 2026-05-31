-- Iboren public booking requests
-- Run this once in Supabase SQL Editor before using /admin/public-requests.

create table if not exists public.public_booking_requests (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'rejected', 'converted')),
  language text not null default 'sv',
  service text not null,
  area text not null,
  address text,
  size_sqm integer,
  frequency text,
  preferred_date date,
  time_window text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_type text,
  rut_requested boolean not null default false,
  notes text,
  admin_notes text,
  converted_booking_id uuid,
  source text not null default 'public_form',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_booking_requests_status_idx on public.public_booking_requests(status);
create index if not exists public_booking_requests_created_at_idx on public.public_booking_requests(created_at desc);
create index if not exists public_booking_requests_email_idx on public.public_booking_requests(lower(customer_email));

drop trigger if exists public_booking_requests_updated_at on public.public_booking_requests;

create or replace function public.set_public_booking_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger public_booking_requests_updated_at
before update on public.public_booking_requests
for each row execute function public.set_public_booking_requests_updated_at();

alter table public.public_booking_requests enable row level security;

-- Public access is blocked by RLS. Server-side routes use SUPABASE_SERVICE_ROLE_KEY.
