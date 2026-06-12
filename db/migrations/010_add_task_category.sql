-- Phase 2A refinement: tag every task with a category so the dashboard
-- can render an icon per task and filter by category. Six fixed
-- categories matching components/TaskCard.tsx's lucide icon mapping.
--
-- Note on numbering: 009 is taken by 009_add_specific_skills.sql;
-- this is the next-available slot.
-- Run AFTER 009.

alter table public.tasks
  add column if not exists category text not null default 'writing'
    check (category in (
      'writing', 'deck', 'code', 'spreadsheet', 'strategy', 'design'
    ));

-- Backfill the seven seeded tasks with the right category.
update public.tasks set category = 'writing'
  where slug in ('written-recommendation', 'growth-strategy');

update public.tasks set category = 'deck'
  where slug = 'pitch-deck';

update public.tasks set category = 'code'
  where slug = 'code-project';

update public.tasks set category = 'spreadsheet'
  where slug = 'financial-model';

update public.tasks set category = 'strategy'
  where slug in ('onboarding-critique', 'uk-launch-plan');
