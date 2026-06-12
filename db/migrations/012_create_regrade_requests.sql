-- Phase 2A+: human regrade requests.
--
-- When a student doesn't trust their AI grade, they can request a
-- human review. The new score may be higher, lower, or unchanged —
-- the dialog text makes that explicit so requests are intentional.
--
-- One request per submission (UNIQUE submission_id). The admin
-- workflow lives outside the table for now (an email goes out at
-- request time, see actions/requestRegrade.ts). Resolution updates
-- happen later via the admin (service_role) connection — students
-- only see pending vs resolved status.
--
-- Run AFTER 011.

create table if not exists public.regrade_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references public.submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'resolved', 'declined')),
  resolved_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists regrade_requests_user_idx
  on public.regrade_requests (user_id, created_at desc);
create index if not exists regrade_requests_status_idx
  on public.regrade_requests (status, created_at desc);

alter table public.regrade_requests enable row level security;

-- Students can read their own regrade requests (to show "already
-- requested" state on the submission page).
drop policy if exists "users can read own regrade requests"
  on public.regrade_requests;
create policy "users can read own regrade requests"
  on public.regrade_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- Students can insert a regrade for their own submission. UNIQUE
-- constraint blocks duplicates; the action also checks idempotency
-- before inserting so the UI sees a clean "already requested" branch.
drop policy if exists "users can insert own regrade requests"
  on public.regrade_requests;
create policy "users can insert own regrade requests"
  on public.regrade_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.submissions s
      where s.id = regrade_requests.submission_id
        and s.user_id = auth.uid()
    )
  );

-- UPDATE/DELETE are intentionally not granted to authenticated —
-- only admins (service_role) resolve or annotate requests.

grant select, insert on public.regrade_requests to authenticated;
grant select, insert, update, delete on public.regrade_requests to service_role;
