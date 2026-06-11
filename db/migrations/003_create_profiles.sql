-- Phase 2A: user profiles extending auth.users.
-- Run in Supabase SQL Editor against the `public` schema, AFTER 001 and 002.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  school text,
  graduation_year integer check (graduation_year between 2024 and 2032),
  career_tracks text[] not null default '{}'::text[],
  self_rated_strategy integer not null default 50
    check (self_rated_strategy between 0 and 100),
  self_rated_execution integer not null default 50
    check (self_rated_execution between 0 and 100),
  self_rated_communication integer not null default 50
    check (self_rated_communication between 0 and 100),
  self_rated_technical integer not null default 50
    check (self_rated_technical between 0 and 100),
  self_rated_creativity integer not null default 50
    check (self_rated_creativity between 0 and 100),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Trigger: auto-create profile on new auth.users insert ─────────────
-- Runs as SECURITY DEFINER so it can write to public.profiles regardless
-- of the role that inserted into auth.users. search_path is pinned to
-- public for safety per Supabase guidance.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Trigger: keep updated_at fresh on every update ────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Table-level GRANTs — newer Supabase projects no longer auto-grant
-- on user-created tables, so explicit grants are required even with RLS.
grant select, update on public.profiles to authenticated;
