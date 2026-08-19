-- Records the company's acknowledgment, at task-creation time, that the
-- task is an unpaid practice/screening brief and not production work.
-- Mirrors the terms_accepted_at pattern on profiles: a nullable
-- timestamp, stamped when the required checkbox is confirmed.
--
-- Nullable so existing tasks (created before this requirement) don't
-- break; the checkbox is enforced only for NEW task creation, in the
-- createTask server action.
--
-- Run AFTER 036.

alter table public.tasks
  add column if not exists unpaid_ack_at timestamptz;
