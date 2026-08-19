-- SECURITY: lock down what an authenticated user may change on their
-- own profiles row via PostgREST.
--
-- Root cause: profiles had a whole-table `grant update ... to
-- authenticated` (migration 003) plus a row-level-only RLS policy
-- ("users can update own profile" — using/with check auth.uid() = id).
-- RLS is row-level, so the blanket column grant let any signed-in user
-- PATCH their own row and set sensitive columns directly — account_type,
-- company_id, is_seed, resume_code, terms_accepted_at (and is_admin once
-- migration 013 is applied) — bypassing every server action.
--
-- Fix: revoke the blanket UPDATE and re-grant UPDATE only on the columns
-- a user legitimately self-edits (profile card, notification toggles,
-- leaderboard opt-in). Everything else is written server-side via the
-- service role, which bypasses column grants.
--
-- FAIL-CLOSED: a column added to profiles in the future is NOT in this
-- grant, so it is not updatable by authenticated until explicitly added
-- here. Locked by default, not writable by default.
--
-- The row-level RLS policy stays in place as the second gate (a user
-- can still only update their OWN row). The touch_updated_at trigger
-- still stamps updated_at — trigger-modified columns are not subject to
-- the invoker's column privileges, so it keeps working without a grant.
--
-- Run AFTER 037, and AFTER deploying the completeOnboarding change that
-- moves its onboarding_completed / terms_accepted_at write to the
-- service role (otherwise onboarding breaks in the window between this
-- migration and that deploy).

revoke update on public.profiles from authenticated;

grant update (
  full_name,
  school,
  graduation_year,
  career_tracks,
  specific_skills,
  self_rated_strategy,
  self_rated_execution,
  self_rated_communication,
  self_rated_technical,
  self_rated_creativity,
  leaderboard_visible,
  notify_on_feedback,
  notify_on_new_tasks
) on public.profiles to authenticated;
