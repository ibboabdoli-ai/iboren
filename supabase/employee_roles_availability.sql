-- Iboren employee roles and availability schema
-- Step 2/3: database foundation only. This file does not change the live UI.
-- Run this manually in Supabase SQL editor after reviewing.

create extension if not exists pgcrypto;

-- Shared updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- User roles are separated from customer profile data.
-- profiles = customer profile details
-- user_roles = access control for admin / supervisor / cleaner / customer
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'customer' check (role in ('admin', 'supervisor', 'cleaner', 'customer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_roles_user_id_unique
  on public.user_roles(user_id)
  where user_id is not null;

create unique index if not exists user_roles_email_unique
  on public.user_roles(lower(email));

drop trigger if exists set_user_roles_updated_at on public.user_roles;
create trigger set_user_roles_updated_at
before update on public.user_roles
for each row execute function public.set_updated_at();

-- Internal helper used by RLS policies.
-- It reads the current user's role by auth user id or JWT email.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ur.role
  from public.user_roles ur
  where ur.active = true
    and (
      ur.user_id = auth.uid()
      or lower(ur.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  order by case when ur.user_id = auth.uid() then 0 else 1 end
  limit 1
$$;

create or replace function public.has_internal_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = any(allowed_roles), false)
$$;

-- Employees are operational users: cleaners, supervisors, admins.
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  name text not null,
  phone text,
  role text not null default 'cleaner' check (role in ('admin', 'supervisor', 'cleaner')),
  active boolean not null default true,
  has_car boolean not null default false,
  max_hours_per_day numeric(4,2) not null default 8 check (max_hours_per_day >= 0 and max_hours_per_day <= 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employees_user_id_unique
  on public.employees(user_id)
  where user_id is not null;

create unique index if not exists employees_email_unique
  on public.employees(lower(email));

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

-- Weekly availability. weekday uses ISO style: 1=Monday, 7=Sunday.
create table if not exists public.employee_availability (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  weekday integer not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create unique index if not exists employee_availability_unique_slot
  on public.employee_availability(employee_id, weekday, start_time, end_time);

drop trigger if exists set_employee_availability_updated_at on public.employee_availability;
create trigger set_employee_availability_updated_at
before update on public.employee_availability
for each row execute function public.set_updated_at();

-- Services a cleaner can perform.
create table if not exists public.employee_skills (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  service text not null check (service in ('Hemstädning', 'Flyttstädning', 'Kontorsstädning', 'Fönsterputs', 'Home cleaning', 'Move-out cleaning', 'Office cleaning', 'Window cleaning')),
  created_at timestamptz not null default now()
);

create unique index if not exists employee_skills_unique
  on public.employee_skills(employee_id, service);

-- Areas a cleaner can work in.
create table if not exists public.employee_areas (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  area text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists employee_areas_unique
  on public.employee_areas(employee_id, lower(area));

-- Assignment between an existing booking and an employee.
create table if not exists public.booking_assignments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'declined', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists booking_assignments_one_active_per_booking
  on public.booking_assignments(booking_id)
  where status in ('assigned', 'accepted');

create index if not exists booking_assignments_employee_id_idx
  on public.booking_assignments(employee_id);

drop trigger if exists set_booking_assignments_updated_at on public.booking_assignments;
create trigger set_booking_assignments_updated_at
before update on public.booking_assignments
for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.user_roles enable row level security;
alter table public.employees enable row level security;
alter table public.employee_availability enable row level security;
alter table public.employee_skills enable row level security;
alter table public.employee_areas enable row level security;
alter table public.booking_assignments enable row level security;

-- user_roles policies
drop policy if exists "Users can read their own role" on public.user_roles;
create policy "Users can read their own role"
  on public.user_roles for select
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.has_internal_role(array['admin', 'supervisor'])
  );

drop policy if exists "Admins can manage roles" on public.user_roles;
create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_internal_role(array['admin']))
  with check (public.has_internal_role(array['admin']));

-- employees policies
drop policy if exists "Employees can read own employee row and managers can read all" on public.employees;
create policy "Employees can read own employee row and managers can read all"
  on public.employees for select
  using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.has_internal_role(array['admin', 'supervisor'])
  );

drop policy if exists "Admins and supervisors can manage employees" on public.employees;
create policy "Admins and supervisors can manage employees"
  on public.employees for all
  using (public.has_internal_role(array['admin', 'supervisor']))
  with check (public.has_internal_role(array['admin', 'supervisor']));

-- employee_availability policies
drop policy if exists "Employees and managers can read availability" on public.employee_availability;
create policy "Employees and managers can read availability"
  on public.employee_availability for select
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Employees can manage own availability and managers can manage all" on public.employee_availability;
create policy "Employees can manage own availability and managers can manage all"
  on public.employee_availability for all
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- employee_skills policies
drop policy if exists "Employees and managers can read skills" on public.employee_skills;
create policy "Employees and managers can read skills"
  on public.employee_skills for select
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Employees can manage own skills and managers can manage all" on public.employee_skills;
create policy "Employees can manage own skills and managers can manage all"
  on public.employee_skills for all
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- employee_areas policies
drop policy if exists "Employees and managers can read areas" on public.employee_areas;
create policy "Employees and managers can read areas"
  on public.employee_areas for select
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Employees can manage own areas and managers can manage all" on public.employee_areas;
create policy "Employees can manage own areas and managers can manage all"
  on public.employee_areas for all
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  )
  with check (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- booking_assignments policies
drop policy if exists "Managers can read all assignments and employees can read own assignments" on public.booking_assignments;
create policy "Managers can read all assignments and employees can read own assignments"
  on public.booking_assignments for select
  using (
    public.has_internal_role(array['admin', 'supervisor'])
    or employee_id in (
      select e.id from public.employees e
      where e.user_id = auth.uid()
         or lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

drop policy if exists "Managers can create and update assignments" on public.booking_assignments;
create policy "Managers can create and update assignments"
  on public.booking_assignments for all
  using (public.has_internal_role(array['admin', 'supervisor']))
  with check (public.has_internal_role(array['admin', 'supervisor']));

-- Optional seed for first admin. Works before user_id is known by matching JWT email.
insert into public.user_roles (email, role, active)
select 'ibbo.abdoli@gmail.com', 'admin', true
where not exists (
  select 1 from public.user_roles where lower(email) = lower('ibbo.abdoli@gmail.com')
);
