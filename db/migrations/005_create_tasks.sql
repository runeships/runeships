-- Phase 2A: tasks belong to a company. Submission mode + per-dimension
-- weights live on the task row so the form and scorer can render and
-- compute identically.
-- Run AFTER 004.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  brief text not null,
  submission_mode text not null
    check (submission_mode in ('text_only', 'link_only', 'text_and_link')),
  estimated_time text,
  weight_strategy numeric not null default 0.2
    check (weight_strategy between 0 and 1),
  weight_execution numeric not null default 0.2
    check (weight_execution between 0 and 1),
  weight_communication numeric not null default 0.2
    check (weight_communication between 0 and 1),
  weight_technical numeric not null default 0.2
    check (weight_technical between 0 and 1),
  weight_creativity numeric not null default 0.2
    check (weight_creativity between 0 and 1),
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),

  -- The five weights must sum to 1.0. Small epsilon tolerates the
  -- floating-point imprecision of numeric arithmetic.
  constraint weights_sum_to_one check (
    abs(
      (weight_strategy + weight_execution + weight_communication
        + weight_technical + weight_creativity) - 1.0
    ) < 0.01
  ),

  -- Slug must be unique within a company so URLs like
  -- /tasks/practice/written-recommendation are stable.
  constraint tasks_company_slug_unique unique (company_id, slug)
);

create index if not exists tasks_company_order_idx
  on public.tasks (company_id, order_index);

create index if not exists tasks_published_idx
  on public.tasks (is_published);

alter table public.tasks enable row level security;

drop policy if exists "anyone can read published tasks" on public.tasks;
create policy "anyone can read published tasks"
  on public.tasks
  for select
  to anon, authenticated
  using (is_published = true);

grant select on public.tasks to anon, authenticated;
