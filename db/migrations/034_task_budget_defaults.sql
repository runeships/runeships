-- Bump the per-task AI token budget. Default rises 20k → 75k for any
-- new task created from here on, and we backfill existing tasks based
-- on whether they're real (company-posted) or demo/practice work.
--
-- Why: 20k covers ~2-3 code submissions or ~5-6 writing submissions
-- before the gate fires. For a real company task that goes to multiple
-- students, that's too tight — 75k gives ~10-14 writing submissions or
-- ~3-4 code submissions of headroom before manual review kicks in.
-- Demo tasks (RuneShips Practice, myOrbit, Veganuño, Godly) don't need
-- the full pool — 40k keeps the seed personas in budget without
-- overspending on placeholder activity.

alter table public.tasks
  alter column ai_token_budget set default 75000;

-- Backfill real-company tasks (not is_demo, not owned by a practice
-- company) to at least 75k.
update public.tasks t
set ai_token_budget = 75000
from public.companies c
where c.id = t.company_id
  and t.is_demo = false
  and c.is_practice = false
  and t.ai_token_budget < 75000;

-- Backfill demo / practice-company tasks to at least 40k.
update public.tasks t
set ai_token_budget = 40000
from public.companies c
where c.id = t.company_id
  and (t.is_demo = true or c.is_practice = true)
  and t.ai_token_budget < 40000;
