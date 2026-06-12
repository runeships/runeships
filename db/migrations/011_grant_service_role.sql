-- Newer Supabase projects don't auto-grant table privileges to the
-- `service_role`. RLS bypass is not the same as table-level GRANTs:
-- without these, INSERTs from the server-action admin client fail with
-- 42501 "permission denied for table feedback".
--
-- We grant the minimum needed for our server actions:
--   - feedback: INSERT (writes from generateFeedback) + SELECT (the
--               idempotency check + .select("id") return).
--   - submissions, tasks, companies, profiles: SELECT so admin-side
--               lookups (if any are added later) keep working without
--               another permissions chase.
--
-- This does NOT affect the anon or authenticated roles — RLS still
-- governs what students see.

grant insert, select on public.feedback to service_role;
grant select on public.submissions to service_role;
grant select on public.tasks to service_role;
grant select on public.companies to service_role;
grant select on public.profiles to service_role;
