-- Step 25A — Time entries for cleaner work reporting
-- Run this in Supabase SQL Editor before testing time reporting.

CREATE TABLE IF NOT EXISTS public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.booking_assignments(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  start_time time,
  end_time time,
  break_minutes integer NOT NULL DEFAULT 0 CHECK (break_minutes >= 0 AND break_minutes <= 480),
  worked_minutes integer NOT NULL CHECK (worked_minutes > 0 AND worked_minutes <= 960),
  travel_minutes integer NOT NULL DEFAULT 0 CHECK (travel_minutes >= 0 AND travel_minutes <= 480),
  mileage_km numeric(8,2) NOT NULL DEFAULT 0 CHECK (mileage_km >= 0 AND mileage_km <= 1000),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'paid')),
  cleaner_note text,
  admin_note text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id)
);

CREATE INDEX IF NOT EXISTS time_entries_employee_date_idx ON public.time_entries(employee_id, work_date DESC);
CREATE INDEX IF NOT EXISTS time_entries_status_date_idx ON public.time_entries(status, work_date DESC);
CREATE INDEX IF NOT EXISTS time_entries_booking_idx ON public.time_entries(booking_id);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- API routes use the service role key, so these policies are mostly future-proofing.
DROP POLICY IF EXISTS "time_entries_select_own_or_staff" ON public.time_entries;
CREATE POLICY "time_entries_select_own_or_staff"
ON public.time_entries
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "time_entries_insert_service" ON public.time_entries;
CREATE POLICY "time_entries_insert_service"
ON public.time_entries
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "time_entries_update_service" ON public.time_entries;
CREATE POLICY "time_entries_update_service"
ON public.time_entries
FOR UPDATE
USING (true)
WITH CHECK (true);
