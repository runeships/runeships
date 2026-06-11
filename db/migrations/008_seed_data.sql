-- Phase 2A seed data: 4 companies, 7 tasks.
-- Run AFTER 007. Re-runnable: `on conflict ... do nothing` makes this
-- idempotent so partial re-runs are safe.

-- ─── Companies ─────────────────────────────────────────────────────────
insert into public.companies (slug, name, description, industry, is_practice)
values
  (
    'practice',
    'RuneShips Practice',
    'Open practice tasks. Build skills and earn your first scores before tackling real company briefs.',
    null,
    true
  ),
  (
    'godly',
    'Godly',
    '[PLACEHOLDER: Diego, edit this with the actual Godly description.]',
    'AI / Consumer software',
    false
  ),
  (
    'myorbit',
    'myOrbit',
    '[PLACEHOLDER: Diego, edit this with the actual myOrbit description.]',
    '[PLACEHOLDER]',
    false
  ),
  (
    'veganuno',
    'Veganuño',
    '[PLACEHOLDER: Diego, edit this with the actual Veganuño description.]',
    'Plant-based food / CPG',
    false
  )
on conflict (slug) do nothing;

-- ─── Tasks ─────────────────────────────────────────────────────────────
-- Dollar-quoted briefs so we don't have to escape apostrophes.

-- ═══ Practice 1: written recommendation ════════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'practice'),
  'written-recommendation',
  'Strategic recommendation: should ContextCo expand internationally?',
  $brief$
ContextCo is a B2B analytics startup based in Austin, Texas. They sell
to mid-market SaaS companies and have reached $4M ARR with 80% gross
margins. Their CEO is debating whether to open a European office in
Q1 2027 to tap a similar market segment in the UK and Germany.

Write a structured recommendation (800-1200 words) covering:

1. Your recommendation (expand now / wait / don't expand) with clear
   reasoning
2. Three to five specific risks you would expect them to face, ordered
   by severity
3. The single most important assumption that would have to be true for
   your recommendation to be correct, and how they should test it
   before committing capital

Be specific. Avoid generic consulting frameworks unless you can apply
them to the actual situation. Show your thinking — we evaluate the
quality of the reasoning, not the conclusion.
$brief$,
  'text_only',
  '2-3 hours',
  0.40, 0.15, 0.30, 0.05, 0.10,
  1, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Practice 2: pitch deck ════════════════════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'practice'),
  'pitch-deck',
  'Pitch deck: build a fundraising deck for a fictional startup',
  $brief$
Build a 10-slide seed-round pitch deck for a fictional B2B or
consumer startup of your choice. The startup should be plausible —
something a founder might actually pitch.

Required slides:
1. Problem
2. Solution
3. Market size (with reasoning, not just numbers)
4. Business model
5. Product / demo
6. Traction (you can fabricate plausible numbers — show how you'd
   present them)
7. Competitive landscape
8. Team (fictional, but credible)
9. Roadmap
10. Ask (round size, use of funds)

Submit a viewable Google Slides or Canva link. Make sure the link is
set to "anyone with the link can view." We evaluate clarity,
narrative flow, and visual hierarchy — not graphic design polish.
$brief$,
  'link_only',
  '4-6 hours',
  0.25, 0.15, 0.35, 0.05, 0.20,
  2, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Practice 3: code project ══════════════════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'practice'),
  'code-project',
  'Code: build and ship a small working tool',
  $brief$
Build and ship a small working tool. Pick one of these prompts (or
propose your own and run it past us):

A. A URL shortener with persistent storage. Custom slugs, click
   tracking, basic API. Any stack.

B. A data dashboard that fetches from a public API of your choice and
   visualizes it. Must update on a schedule or refresh button.
   Charts, not just tables.

C. A markdown blog engine that renders posts from a folder of .md
   files with frontmatter. Should support tags and basic SEO.

Submit a GitHub repo link. The README must include: what you built,
how to run it locally, and one paragraph on a design decision you
made and why. Bonus if it's deployed (Vercel/Railway/Fly).

We evaluate working code, code structure, README quality, and your
ability to make and defend a design decision.
$brief$,
  'link_only',
  '4-8 hours',
  0.10, 0.25, 0.10, 0.45, 0.10,
  3, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Practice 4: financial model ═══════════════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'practice'),
  'financial-model',
  'Financial model: 3-year P&L for a fictional SaaS startup',
  $brief$
Build a 3-year P&L projection for a fictional B2B SaaS startup of
your choice. Submit as a viewable Google Sheets link.

Required:
- Revenue model with explicit assumptions (pricing, customer count
  ramp, churn)
- COGS line items
- Operating expenses (payroll, marketing, tools, other)
- Headcount plan over 3 years
- Monthly cash flow + runway calculation
- A clearly labeled assumptions tab where someone could change
  inputs and see results update

Bonus:
- A scenario toggle (base / aggressive / conservative)
- A clear "story" the model tells about when the company hits
  breakeven and what gets it there

We evaluate: structural soundness, formula quality, assumption
clarity, and whether someone unfamiliar with the model could read
it and understand the bet.

Confirm the link is set to "anyone with the link can view" — we
will not chase you for access.
$brief$,
  'link_only',
  '3-5 hours',
  0.30, 0.25, 0.10, 0.35, 0.00,
  4, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Company 1: Godly — onboarding critique ════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'godly'),
  'onboarding-critique',
  'Onboarding critique: where does Godly lose new users?',
  $brief$
[PLACEHOLDER — Diego, swap in actual Godly context. Below is a
generic version assuming Godly is an AI-powered consumer product.]

Godly is an AI-powered creative tool used by ~12,000 monthly active
users. We're seeing significant drop-off in our first-time user
flow — only 28% of sign-ups complete their first meaningful action
within 48 hours.

Walk through our onboarding from a fresh user's perspective. Then
submit:

1. A short write-up (400-600 words) identifying the 3-5 highest-
   friction points and what you think is causing each
2. A supporting link to a more detailed analysis — could be a
   Loom video walkthrough, an annotated screenshot doc, or a
   written brief with proposed flow changes

Priority-rank your recommendations by expected impact vs.
implementation cost. We don't need polish — we need sharp thinking
and concrete suggestions.
$brief$,
  'text_and_link',
  '3-5 hours',
  0.30, 0.15, 0.25, 0.10, 0.20,
  1, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Company 2: myOrbit — growth strategy ══════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'myorbit'),
  'growth-strategy',
  'Growth strategy: how should myOrbit reach the next 10,000 users?',
  $brief$
[PLACEHOLDER — Diego, swap in actual myOrbit context.]

myOrbit has ~1,500 active users and wants to reach 10,000 within 12
months. Build a structured growth plan (800-1200 words) covering:

1. Three to four acquisition channels worth testing, with explicit
   reasoning on why each could fit the product
2. The single channel you'd bet heaviest on — with a 4-week test
   plan (budget, success metric, kill criteria)
3. Two or three early signals that would tell us product-market fit
   is real enough to invest behind, vs. signals that would tell us
   to pause and rebuild

Show your reasoning. We're not looking for "do all the channels"
playbooks — we want to see how you make tradeoffs under uncertainty.
$brief$,
  'text_only',
  '3-4 hours',
  0.40, 0.10, 0.30, 0.05, 0.15,
  1, true
)
on conflict (company_id, slug) do nothing;

-- ═══ Company 3: Veganuño — UK launch plan ══════════════════════════════
insert into public.tasks (
  company_id, slug, title, brief, submission_mode, estimated_time,
  weight_strategy, weight_execution, weight_communication,
  weight_technical, weight_creativity, order_index, is_published
) values (
  (select id from public.companies where slug = 'veganuno'),
  'uk-launch-plan',
  'Launch plan: bringing Veganuño to the UK market',
  $brief$
[PLACEHOLDER — Diego, swap in actual Veganuño context.]

Veganuño is a Spanish plant-based food brand currently in 200+
supermarkets across Spain. We're evaluating a UK market entry for
late 2026.

Build a go-to-market plan covering:

1. Distribution strategy — DTC, retail (Tesco/Sainsburys/Waitrose),
   foodservice, or a mix. Defend the call.
2. Initial product range — which 3-4 SKUs to lead with and why
3. Marketing positioning vs. UK competitors (THIS Isn't, Beyond Meat,
   Quorn). Where do we win?
4. A simple 12-month P&L model showing expected revenue, costs, and
   timing to breakeven — submit as a viewable Google Sheets link in
   the supporting link field

Text submission should be the strategic write-up (600-900 words).
The spreadsheet handles the numbers. We evaluate both — strategy
without numbers is a wishlist, numbers without strategy is a
spreadsheet.
$brief$,
  'text_and_link',
  '5-8 hours',
  0.30, 0.20, 0.20, 0.20, 0.10,
  1, true
)
on conflict (company_id, slug) do nothing;
