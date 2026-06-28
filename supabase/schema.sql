create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'End User' check (role in ('Admin', 'Technician', 'End User')),
  department text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  title text not null,
  description text not null,
  category text not null check (category in ('Hardware', 'Software', 'Network', 'Microsoft 365', 'Account Access', 'Printer', 'Email', 'Security', 'Other')),
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Waiting on User', 'Resolved', 'Closed')),
  created_by uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  due_at timestamptz not null,
  resolved_at timestamptz,
  resolution_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  comment text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_activity (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_activity enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Admin can read all profiles"
on public.profiles for select
using (public.current_user_role() = 'Admin');

create policy "Admin can update profiles"
on public.profiles for update
using (public.current_user_role() = 'Admin')
with check (public.current_user_role() = 'Admin');

create policy "Users can create tickets"
on public.tickets for insert
with check (created_by = auth.uid());

create policy "Users can read their own tickets"
on public.tickets for select
using (created_by = auth.uid());

create policy "Technicians can read assigned tickets"
on public.tickets for select
using (assigned_to = auth.uid() and public.current_user_role() = 'Technician');

create policy "Admin can read all tickets"
on public.tickets for select
using (public.current_user_role() = 'Admin');

create policy "Admin and technicians can update tickets"
on public.tickets for update
using (public.current_user_role() in ('Admin', 'Technician'))
with check (public.current_user_role() in ('Admin', 'Technician'));

create policy "End users can reopen their own tickets"
on public.tickets for update
using (created_by = auth.uid() and status in ('Resolved', 'Closed'))
with check (created_by = auth.uid());

create policy "Users can comment on their own tickets"
on public.ticket_comments for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tickets
    where tickets.id = ticket_comments.ticket_id
    and (
      tickets.created_by = auth.uid()
      or tickets.assigned_to = auth.uid()
      or public.current_user_role() = 'Admin'
    )
  )
);

create policy "Comments are visible by ticket access and internal role"
on public.ticket_comments for select
using (
  exists (
    select 1 from public.tickets
    where tickets.id = ticket_comments.ticket_id
    and (
      tickets.created_by = auth.uid()
      or tickets.assigned_to = auth.uid()
      or public.current_user_role() = 'Admin'
    )
  )
  and (
    is_internal = false
    or public.current_user_role() in ('Admin', 'Technician')
  )
);

create policy "Activity is visible by ticket access"
on public.ticket_activity for select
using (
  exists (
    select 1 from public.tickets
    where tickets.id = ticket_activity.ticket_id
    and (
      tickets.created_by = auth.uid()
      or tickets.assigned_to = auth.uid()
      or public.current_user_role() = 'Admin'
    )
  )
);

create policy "Staff can insert activity"
on public.ticket_activity for insert
with check (public.current_user_role() in ('Admin', 'Technician', 'End User'));

create or replace function public.set_ticket_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ticket_updated_at on public.tickets;
create trigger set_ticket_updated_at
before update on public.tickets
for each row execute function public.set_ticket_updated_at();
