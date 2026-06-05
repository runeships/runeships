-- Inbound leads from the "For companies" CTA on the landing page.
-- Run in Supabase SQL Editor against the `public` schema.

create table if not exists public.company_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text not null,
  task_description text,
  created_at timestamptz not null default now()
);

alter table public.company_leads enable row level security;

-- Same posture as waitlist: anon inserts only, no reads.
drop policy if exists "anon can insert company_leads" on public.company_leads;
create policy "anon can insert company_leads"
  on public.company_leads
  for insert
  to anon
  with check (true);
