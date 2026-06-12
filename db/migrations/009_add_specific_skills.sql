-- Phase 2A refinement: split "what the user is aiming at" into two
-- concepts. `career_tracks` stays as the high-level industry/role
-- direction (Finance, Consulting, Product Management, ...).
-- `specific_skills` is the new column for tools/languages/software
-- (Python, Excel, Figma, ...).
--
-- Both are text[] so onboarding can store an arbitrary list plus any
-- free-text "Other" entries. Run AFTER 008.

alter table public.profiles
  add column if not exists specific_skills text[] not null default '{}'::text[];
