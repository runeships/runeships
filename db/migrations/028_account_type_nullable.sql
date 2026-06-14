-- Make profiles.account_type nullable, no default.
--
-- Why: the on_auth_user_created trigger (003) auto-inserts a profile
-- row on signup. With account_type defaulting to 'student' (from 026),
-- brand-new signups get account_type='student' instantly — so the
-- /auth/callback logic that should send them to /onboarding/select-type
-- thinks they've already picked, and routes them straight to the
-- student onboarding flow. Companies never see the type chooser.
--
-- After this migration: new profiles arrive with account_type=NULL.
-- The auth callback treats NULL as "hasn't chosen yet" → select-type.
-- Existing rows (all student) keep their value and continue to work.

alter table public.profiles
  alter column account_type drop default;

alter table public.profiles
  alter column account_type drop not null;
