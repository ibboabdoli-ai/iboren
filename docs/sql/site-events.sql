-- Iboren: privacy-safe website analytics (no names, emails, phones, IP addresses or form values)
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('page_view', 'quote_cta_click', 'booking_cta_click')),
  path text not null check (char_length(path) <= 160),
  language text not null default 'sv' check (language in ('sv', 'en')),
  created_at timestamptz not null default now()
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_event_created_at_idx on public.site_events (event_name, created_at desc);

alter table public.site_events enable row level security;
