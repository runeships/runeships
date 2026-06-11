-- Phase 2A: companies that post tasks (plus the synthetic "Practice" company).
-- Run AFTER 003.

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  industry text,
  logo_url text,
  website_url text,
  is_practice boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

-- Companies are public — anyone (signed in or not) can read.
drop policy if exists "anyone can read companies" on public.companies;
create policy "anyone can read companies"
  on public.companies
  for select
  to anon, authenticated
  using (true);

grant select on public.companies to anon, authenticated;
