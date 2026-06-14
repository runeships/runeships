-- Company-side platform: account types, company-user links, optional
-- company-level metadata, task ownership + attachments, demo flag for
-- existing seeded tasks, and a notification preference for companies.
--
-- Originally specced as migration 019 — slot taken by the
-- add_task_dataset_url migration. This is 026.
--
-- Run AFTER 025.

-- ─── Profile: account type + company link ─────────────────────────
alter table public.profiles
  add column if not exists account_type text not null default 'student'
  check (account_type in ('student', 'company'));

alter table public.profiles
  add column if not exists company_id uuid
    references public.companies(id) on delete set null;

alter table public.profiles
  add column if not exists notify_on_new_submission boolean not null default true;

create index if not exists profiles_account_type_idx
  on public.profiles (account_type);
create index if not exists profiles_company_id_idx
  on public.profiles (company_id);

-- ─── Companies: optional metadata captured during signup ──────────
alter table public.companies
  add column if not exists industry text;
alter table public.companies
  add column if not exists size_band text
    check (size_band in ('1-10', '11-50', '51-200', '201-1000', '1000+'));
alter table public.companies
  add column if not exists website text;
alter table public.companies
  add column if not exists owner_email text;
alter table public.companies
  add column if not exists task_categories text[];

-- ─── Tasks: ownership + attachments + demo flag ───────────────────
alter table public.tasks
  add column if not exists created_by uuid
    references auth.users(id) on delete set null;

alter table public.tasks
  add column if not exists attachments jsonb not null default '[]'::jsonb;

alter table public.tasks
  add column if not exists is_demo boolean not null default false;

-- Mark all existing static tasks as demo so real company users
-- never see them in their own dashboard. Practice company slug is
-- 'practice' (verified against the live DB) — the spec referenced
-- 'runeships-practice' but that's not the actual slug.
update public.tasks
set is_demo = true
where company_id in (
  select id from public.companies
  where slug in ('practice', 'godly', 'myorbit', 'veganuno')
);

create index if not exists tasks_created_by_idx on public.tasks (created_by);
create index if not exists tasks_is_demo_idx on public.tasks (is_demo);
