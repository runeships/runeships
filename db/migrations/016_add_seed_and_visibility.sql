-- Seed-user flag + leaderboard visibility opt-out.
--
-- (Originally specced as migration 012 — slot taken by
-- regrade_requests, so this lands as 016.)
--
-- is_seed: true for the demo profiles populated via
-- scripts/seed-demo-users.ts. Lets us cleanly nuke fake data via
-- scripts/clear-demo-users.ts without touching real students.
--
-- leaderboard_visible: per-user opt-in to the /leaderboard page +
-- cohort percentile aggregates. Default true so freshly signed-up
-- students appear immediately; they can opt out from
-- /profile?tab=account. Seed users are visible by default so the
-- demo cohort acts like a real cohort.
--
-- Partial index covers the common leaderboard query path.
--
-- Run AFTER 015.

alter table public.profiles
  add column if not exists is_seed boolean not null default false;

alter table public.profiles
  add column if not exists leaderboard_visible boolean not null default true;

create index if not exists profiles_leaderboard_idx
  on public.profiles (leaderboard_visible, is_seed)
  where leaderboard_visible = true;
