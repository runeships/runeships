-- Email notification preferences. Currently a single boolean for the
-- "feedback ready" email — wire is in place but the email itself
-- ships in a later update. Default true so existing accounts get the
-- email when we turn it on; users can opt out from /profile?tab=account.
--
-- (Originally specced as migration 011 — slots 011/012/013 had been
-- consumed by service-role grants, regrade_requests, and the admin
-- flag respectively.)
--
-- Run AFTER 013.

alter table public.profiles
  add column if not exists notify_on_feedback boolean not null default true;
