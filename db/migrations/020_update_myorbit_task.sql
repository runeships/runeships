-- Replace the myOrbit growth-strategy placeholder with a Python
-- debugging assessment. Realistic Flask/SQLite codebase with 13
-- planted bugs across difficulty levels.
--
-- Originally specced as migration 014 — slot taken by the
-- notification-prefs migration. This is 020.
--
-- The slug intentionally stays as 'growth-strategy' because 20 seed
-- submissions already reference this task by id; the safety rule
-- (matching the Veganuño task swap) is to keep the slug when
-- submissions exist so old URLs continue to resolve. Only the
-- content + scoring shape change.
--
-- Run AFTER 019.

update public.tasks
set
  title = 'Debug the codebase: find and fix bugs across a Python/Flask service',
  brief = $brief$# Debug a codebase — myOrbit Customer Engagement

myOrbit is a (fictional) SaaS platform that tracks customer engagement, manages subscriptions, and computes engagement scores. Our backend is a small Python/Flask service backed by SQLite. We've had a rough sprint — production bugs piling up, edge cases breaking, an off-by-one here, a precision issue there. We need help.

**[Download the codebase](/tasks/myorbit/myorbit-debug.zip)** — Python project, ~400 lines across 8 files, pytest suite included.

## Your task

Read the code. Read `BUGS.md`. Run the tests. Fix the bugs.

There are **13 known issues** in the codebase, ranging from obvious (a 404 endpoint that crashes) to subtle (a class-level mutable default that silently shares state across worker instances). About half are caught by the test suite; the rest require careful code reading to spot.

## What we're testing

- **Code reading** — can you navigate an unfamiliar codebase and build a mental model fast
- **Test interpretation** — can you read a failing test, understand what it expects, and trace the assertion to the bug
- **Debugging methodology** — hypothesis → test → fix, not pattern-matching to "looks broken"
- **Idiomatic Python** — knowing why mutable defaults, naive datetimes, and float arithmetic for money are footguns
- **Security awareness** — spotting SQL injection, validation gaps, resource leaks
- **Performance instincts** — recognizing O(n²) where O(n) is one dict away
- **Architectural understanding** — connection lifecycle, timezone handling, separation of concerns

## How to work

1. Unzip the project
2. `pip install -r requirements.txt`
3. `python -m myorbit.seed` to populate sample data
4. `pytest` to see what's failing
5. Read `BUGS.md` for the symptoms our team has reported (they're written from the company's perspective — no hints about which file or function is broken)
6. Fix the bugs. Add a `# FIX:` comment next to each fix explaining what was wrong and why your fix works.
7. Run `pytest` again — all tests must pass

## What "good" looks like

- All tests pass
- All 13 reported issues addressed (a strong submission catches most; an exceptional one finds additional bugs we didn't flag)
- Each fix is minimal and idiomatic — not over-engineered, not under-thought
- `# FIX:` comments are short and clear about the bug + reasoning
- Code style remains consistent with the rest of the file

## Submission

When done, upload your fixed codebase to one of:

- **GitHub** — public repo, share the link (preferred)
- **Public Gist** — for small fixes (less ideal for multi-file changes)
- **Google Drive / Dropbox** — upload the zipped fixed code with sharing enabled

Submit the link in the field below.

Estimated time: 3-5 hours of focused work. Take the time to do it right — we'd rather see 9 clean, well-reasoned fixes than 13 sloppy ones.$brief$,
  submission_mode = 'link_only',
  category = 'code',
  weight_strategy = 0.15,
  weight_execution = 0.30,
  weight_communication = 0.10,
  weight_technical = 0.40,
  weight_creativity = 0.05,
  estimated_time = '3-5 hours',
  -- Wire the zip into the dataset_url system so the same editorial
  -- 'Starter dataset' download panel renders above the brief. The
  -- markdown link inside the brief becomes a redundant secondary
  -- reference; the panel is the primary download CTA.
  dataset_url = '/tasks/myorbit/myorbit-debug.zip',
  dataset_label = 'myOrbit Customer Engagement codebase — Python/Flask, ~400 lines, 13 planted bugs, pytest suite included'
where slug = 'growth-strategy';
