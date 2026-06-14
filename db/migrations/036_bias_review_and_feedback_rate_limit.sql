-- ─── Bias review on task briefs ──────────────────────────────────
-- When a company posts a task, we run an AI moderation pass on the
-- brief and flag potential demographic-filtering language for admin
-- review. We don't auto-unpublish — false positives would frustrate
-- legitimate users — but the badge on /admin/tasks lets admin
-- intervene before scale.
alter table public.tasks
  add column if not exists bias_review_needed boolean not null default false,
  add column if not exists bias_review_note text;

create index if not exists tasks_bias_review_idx
  on public.tasks (bias_review_needed)
  where bias_review_needed = true;

-- ─── Per-user feedback rate limit ────────────────────────────────
-- Log of feedback submissions so we can cap each user at 5 per 24h.
-- Without this someone could spam the inbox or drain the Resend
-- monthly quota by sitting on the FeedbackModal.
create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists feedback_submissions_user_created_idx
  on public.feedback_submissions (user_id, created_at desc);

alter table public.feedback_submissions enable row level security;
