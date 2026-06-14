-- Soft-flag tasks that companies have asked us to delete. Admin
-- reviews the request in /admin/tasks and either deletes the task
-- (cascades to submissions + feedback via the existing FK chain)
-- or clears the flag. No new table — keeps everything queryable
-- with one join.

alter table public.tasks
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists deletion_request_note text;

-- Sparse index — pending requests are the only rows we filter on
-- regularly. The 'where' clause keeps the index tiny.
create index if not exists tasks_deletion_requested_at_idx
  on public.tasks (deletion_requested_at)
  where deletion_requested_at is not null;
