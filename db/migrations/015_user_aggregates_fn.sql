-- Postgres function powering the rankings helper in lib/rankings.ts.
--
-- Computes one aggregate row per user: average of the BEST score
-- per task per dimension. Matches CLAUDE.md ranking rule —
-- "best per task, not average per task" — by using MAX() inside the
-- best_per_task CTE.
--
-- Function is invoked from server actions via the service_role admin
-- client (rpc("get_user_aggregates")). Service role bypasses RLS so
-- the function sees every user's feedback. Privacy is enforced at
-- the TypeScript layer (lib/rankings.ts) which only returns
-- aggregates and the caller's own data — never another user's rows.
--
-- Run AFTER 014.

create or replace function public.get_user_aggregates()
returns table (
  user_id uuid,
  strategy numeric,
  execution numeric,
  communication numeric,
  technical numeric,
  creativity numeric,
  task_count bigint
)
language sql
stable
as $$
  with best_per_task as (
    select
      s.user_id,
      s.task_id,
      max(f.score_strategy)      as strategy,
      max(f.score_execution)     as execution,
      max(f.score_communication) as communication,
      max(f.score_technical)     as technical,
      max(f.score_creativity)    as creativity
    from public.feedback f
    join public.submissions s on s.id = f.submission_id
    group by s.user_id, s.task_id
  )
  select
    user_id,
    avg(strategy)::numeric      as strategy,
    avg(execution)::numeric     as execution,
    avg(communication)::numeric as communication,
    avg(technical)::numeric     as technical,
    avg(creativity)::numeric    as creativity,
    count(*)::bigint            as task_count
  from best_per_task
  group by user_id;
$$;

grant execute on function public.get_user_aggregates() to service_role;
