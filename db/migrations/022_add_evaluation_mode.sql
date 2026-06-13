-- Evaluation mode flag on tasks. Tasks default to 'ai' (Claude Haiku
-- 4.5 scores the submission). Tasks marked 'human' skip generateFeedback
-- and route to /admin instead — Diego (or any admin) scores them
-- manually using the same five-dimension rubric.
--
-- Originally specced as migration 015 — slot taken by the
-- user_aggregates RPC migration. This is 022.
--
-- Run AFTER 021.

alter table public.tasks
  add column if not exists evaluation_mode text not null default 'ai'
  check (evaluation_mode in ('ai', 'human'));

create index if not exists tasks_eval_mode_idx
  on public.tasks (evaluation_mode);
