-- Waitlist signups from the landing hero.
-- Run in Supabase SQL Editor against the `public` schema.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'landing_hero',
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness on email so the same address can't spam-sign-up.
create unique index if not exists waitlist_email_unique
  on public.waitlist (lower(email));

-- GRANT must come before / alongside the RLS policy. On newer Supabase
-- projects the default public-schema GRANTs to anon are no longer
-- applied, so without this an INSERT fails at the table-permission
-- check with code 42501 ("permission denied for table") before RLS
-- even runs.
grant insert on public.waitlist to anon;

alter table public.waitlist enable row level security;

-- Anyone (anon role, used by the server action with the publishable key)
-- can insert. Reads are intentionally not granted; admin reads go through
-- the service_role key from the dashboard or future internal tooling.
drop policy if exists "anon can insert waitlist" on public.waitlist;
create policy "anon can insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (true);
