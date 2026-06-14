-- Cache an AI-generated 1-2 sentence CV-friendly description on
-- each task. First user to include a task on their CV builder
-- triggers the generation; everyone after reads the cached value.
-- Same text per task across all students — it describes the work
-- in general, not what any one student did.

alter table public.tasks
  add column if not exists cv_summary text;
