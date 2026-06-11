-- Phase 2A: a submission is one attempt by one user on one task.
-- Multiple submissions per (user, task) are allowed. The 24-hour cooldown
-- between submissions on the same task is enforced at the application
-- layer (not in SQL) so we can surface a friendly UI message instead of
-- a Postgres error.
-- Run AFTER 005.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  submission_title text not null,
  submission_body text,
  supporting_link text,
  link_access_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Covers the cooldown check (find newest submission per user+task) and
-- the profile history query (newest first per user).
create index if not exists submissions_user_task_created_idx
  on public.submissions (user_id, task_id, created_at desc);

alter table public.submissions enable row level security;

drop policy if exists "users can read own submissions" on public.submissions;
create policy "users can read own submissions"
  on public.submissions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can insert own submissions" on public.submissions;
create policy "users can insert own submissions"
  on public.submissions
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- No UPDATE / DELETE policies — submissions are immutable once created.

grant select, insert on public.submissions to authenticated;
