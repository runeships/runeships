-- Per-company storage usage tracking. Without this, a company could
-- repeatedly post tasks with 5×50MB attachments and then mark them
-- deleted — burning through the Supabase Storage allowance with no
-- cap. The createTask action now reads + increments this counter on
-- every upload and blocks once a company hits its quota.
--
-- Default cap (enforced in app code) is 500MB per company. Bump
-- individual companies via SQL if a real customer ever needs more.

alter table public.companies
  add column if not exists storage_bytes_used bigint not null default 0;

-- Optional index in case we ever want to query "companies near
-- quota" for proactive outreach.
create index if not exists companies_storage_used_idx
  on public.companies (storage_bytes_used);
