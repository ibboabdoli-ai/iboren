-- Iboren booking duplicate protection
-- Purpose:
-- Prevent duplicate active booking requests with the same practical booking identity.
-- Cancelled bookings are excluded so a customer can book the same details again after cancellation.

-- IMPORTANT:
-- Run this after old duplicates have been handled, or use the cleanup query below first.

-- Optional duplicate inspection query:
-- select
--   user_id,
--   service,
--   coalesce(address, '') as address,
--   coalesce(size_sqm, -1) as size_sqm,
--   coalesce(frequency, '') as frequency,
--   preferred_date,
--   coalesce(time_window, '') as time_window,
--   lower(customer_email) as customer_email,
--   count(*) as duplicate_count,
--   array_agg(id order by created_at desc) as booking_ids
-- from public.bookings
-- where coalesce(status, 'new') <> 'cancelled'
-- group by
--   user_id,
--   service,
--   coalesce(address, ''),
--   coalesce(size_sqm, -1),
--   coalesce(frequency, ''),
--   preferred_date,
--   coalesce(time_window, ''),
--   lower(customer_email)
-- having count(*) > 1;

create unique index if not exists bookings_unique_active_request_idx
on public.bookings (
  user_id,
  service,
  coalesce(address, ''),
  coalesce(size_sqm, -1),
  coalesce(frequency, ''),
  preferred_date,
  coalesce(time_window, ''),
  lower(customer_email)
)
where coalesce(status, 'new') <> 'cancelled';
