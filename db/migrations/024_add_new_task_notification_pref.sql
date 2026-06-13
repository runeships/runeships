-- Second email notification preference: new-task announcements.
-- Defaults true so freshly-onboarded students are opted in; they
-- can turn it off from /profile?tab=account. Matching logic lives
-- in app/actions/notifyNewTask.ts — it filters by leaderboard_visible
-- + notify_on_new_tasks + is_seed=false + a career_tracks overlap
-- check against the task's primary dimensions.
--
-- Originally specced as migration 017 — slot taken by the
-- grant_service_role_writes migration. This is 024.
--
-- Run AFTER 023.

alter table public.profiles
  add column if not exists notify_on_new_tasks boolean not null default true;
