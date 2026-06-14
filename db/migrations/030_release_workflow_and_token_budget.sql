-- Token budget per task (shared pool across all student submissions
-- to it) + admin-gated release of submissions to companies.
--
-- Token budget rationale: writing tasks use ~3-4k tokens per AI run
-- so a 20k budget covers ~5 submissions; github-repo tasks use
-- ~15-20k tokens per run (the repo contents get injected into the
-- prompt) so a 20k budget covers ~1 submission. Once exhausted,
-- additional submissions fall through to admin manual review.
--
-- Release rationale: students may submit profanity, broken links,
-- or low-effort work. Admin reviews everything first and clicks
-- 'Release to company' per submission. Until then the company
-- sees a pending count but not the submission itself.

alter table public.tasks
  add column if not exists ai_token_budget int not null default 20000,
  add column if not exists ai_tokens_used int not null default 0;

alter table public.submissions
  add column if not exists released_to_company boolean not null default false,
  add column if not exists released_at timestamptz;

-- Sparse-ish index for the company-side filter "show me only released
-- submissions to my task" and for the admin sort.
create index if not exists submissions_task_released_idx
  on public.submissions (task_id, released_to_company);
