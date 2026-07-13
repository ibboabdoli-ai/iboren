-- Run once in the Supabase SQL editor before enabling review invitations.
-- Keep this file with the project as the source of truth for the review table.
-- Review rows are private by default; only server routes using the service-role key access them.
create table if not exists public.booking_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  customer_name text,
  customer_email text not null,
  language text not null default 'sv' check (language in ('sv', 'en')),
  expires_at timestamptz not null default (now() + interval '45 days'),
  rating smallint check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1200),
  status text not null default 'pending' check (status in ('pending', 'submitted', 'approved', 'rejected')),
  invited_at timestamptz not null default now(),
  submitted_at timestamptz,
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_reviews enable row level security;
create index if not exists booking_reviews_status_submitted_at_idx on public.booking_reviews(status, submitted_at desc);

-- Safe upgrade for databases where the first version of this table already exists.
alter table public.booking_reviews add column if not exists expires_at timestamptz;
update public.booking_reviews set expires_at = invited_at + interval '45 days' where expires_at is null;
alter table public.booking_reviews alter column expires_at set default (now() + interval '45 days');
alter table public.booking_reviews alter column expires_at set not null;
