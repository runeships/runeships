-- Grants the write privileges that migration 011 missed.
--
-- 011 gave service_role SELECT-only on most tables and INSERT only
-- on feedback (because that was the only write path needed at the
-- time). The seed script + future admin tooling need to UPDATE
-- profiles and INSERT submissions through the service-role admin
-- client, which currently fails with 42501 'permission denied'.
--
-- Grant the full INSERT/UPDATE/DELETE set on the tables service_role
-- is allowed to touch directly. RLS already governs anon and
-- authenticated; service_role bypasses RLS so these grants are the
-- only access gate.
--
-- Run AFTER 016.

grant insert, update, delete on public.profiles to service_role;
grant insert, update, delete on public.submissions to service_role;
grant update, delete on public.feedback to service_role;
grant insert, update, delete on public.tasks to service_role;
grant insert, update, delete on public.companies to service_role;
grant insert, update, delete on public.regrade_requests to service_role;
