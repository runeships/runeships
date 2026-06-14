-- Supabase Storage bucket for files attached to company-posted tasks
-- (briefs, datasets, code zips, video references, etc.). Public read
-- so students can download without auth handshake; authenticated
-- write so only signed-in company users can upload.
--
-- Per-object cap 50 MB. Per-task we enforce 5 files max in the
-- createTask server action.
--
-- Run AFTER 026.

insert into storage.buckets (id, name, public, file_size_limit)
values ('task-attachments', 'task-attachments', true, 52428800)
on conflict (id) do nothing;

-- Anyone (including anon) can read objects in this bucket. Files
-- are referenced by URLs that already live in tasks.attachments.
drop policy if exists "task_attachments_public_read"
  on storage.objects;
create policy "task_attachments_public_read"
  on storage.objects
  for select
  using (bucket_id = 'task-attachments');

-- Only authenticated users can upload. Path-shape validation
-- (must start with the uploader's company_id) is enforced in the
-- server action, not in RLS, since per-row owner→company lookups
-- via subquery slow down every upload.
drop policy if exists "task_attachments_authenticated_insert"
  on storage.objects;
create policy "task_attachments_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'task-attachments');

-- Owners can delete their own objects (used by the orphan-cleanup
-- path on failed task creation).
drop policy if exists "task_attachments_owner_delete"
  on storage.objects;
create policy "task_attachments_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'task-attachments'
    and owner = auth.uid()
  );
