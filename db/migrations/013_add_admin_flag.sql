-- Admin role flag on profiles. Keeps the role as data (flip a boolean
-- in the SQL editor) instead of code (redeploy to update an env var
-- allowlist). The /admin/* routes call requireAdmin() which checks
-- this flag on every request.
--
-- Default false: every newly created profile is a regular student.
-- Promote to admin manually after signup:
--   update public.profiles set is_admin = true where email = '…';
--
-- Run AFTER 012.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Partial index so the admin lookups stay constant-time even if the
-- profiles table grows large. The vast majority of rows have
-- is_admin = false and don't need to sit in the index.
create index if not exists profiles_is_admin_idx
  on public.profiles (is_admin)
  where is_admin = true;
