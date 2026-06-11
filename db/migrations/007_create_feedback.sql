-- Phase 2A: AI-generated feedback for a submission. One feedback row per
-- submission (UNIQUE submission_id). Inserts happen exclusively through
-- server actions running with the service_role key, so RLS only governs
-- reads — students can read feedback on their own submissions.
-- Run AFTER 006.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references public.submissions(id) on delete cascade,
  score_strategy integer not null
    check (score_strategy between 0 and 100),
  score_execution integer not null
    check (score_execution between 0 and 100),
  score_communication integer not null
    check (score_communication between 0 and 100),
  score_technical integer not null
    check (score_technical between 0 and 100),
  score_creativity integer not null
    check (score_creativity between 0 and 100),
  -- Weighted total computed by the server action at insert time using the
  -- task's per-dimension weights. Stored to avoid recomputing on every
  -- ranking query.
  total_score numeric not null,
  qualitative_feedback text not null,
  model_used text not null default 'claude-haiku-4-5-20251001',
  generated_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Students can read feedback on their own submissions only.
drop policy if exists "users can read own feedback" on public.feedback;
create policy "users can read own feedback"
  on public.feedback
  for select
  to authenticated
  using (
    exists (
      select 1 from public.submissions s
      where s.id = feedback.submission_id
        and s.user_id = auth.uid()
    )
  );

-- INSERT is service_role only. service_role bypasses RLS entirely, so
-- no INSERT policy is needed here — and we deliberately do NOT grant
-- INSERT to anon or authenticated.

grant select on public.feedback to authenticated;
