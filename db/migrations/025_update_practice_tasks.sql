-- Flesh out all 4 practice task briefs with substantive fictional
-- context (ContextCo, Lumio, FieldNote), detailed deliverable specs,
-- quality criteria, and submission instructions. Matches the depth
-- of the Veganuño / myOrbit / Godly company briefs.
--
-- Originally specced as migration 018 — slot taken by the
-- Veganuño task swap. This is 025.
--
-- All four slugs (written-recommendation, pitch-deck, code-project,
-- financial-model) already exist on the 'practice' company. We
-- preserve them so seed-data submissions on these tasks continue
-- to resolve. Categories + submission_modes are restated for
-- safety even when they already match.
--
-- Run AFTER 024.

-- ─── Practice 1: written recommendation ────────────────────────
update public.tasks
set
  title = 'Strategic recommendation: should ContextCo expand internationally?',
  submission_mode = 'text_only',
  category = 'writing',
  weight_strategy = 0.40,
  weight_execution = 0.15,
  weight_communication = 0.30,
  weight_technical = 0.05,
  weight_creativity = 0.10,
  estimated_time = '2-4 hours',
  brief = $brief$# Strategic recommendation: should ContextCo expand internationally?

ContextCo is a fictional B2B SaaS company. Your task is to deliver a strategic recommendation an experienced operator could actually take to a board meeting.

## About ContextCo

**The product.** Content intelligence software for marketing teams. The platform analyzes content performance across channels, identifies what's resonating with which audiences, and recommends what to publish next. Its differentiator is a proprietary "resonance score" — a metric that combines engagement, sentiment, and downstream conversion correlation. Competitors track engagement; ContextCo tracks whether content actually moves the business.

**Stage and scale.** Series A, raised $14M eighteen months ago led by Underscore VC. Currently $8.2M ARR growing roughly 75% year-over-year. Forty-five employees, all US-based (HQ Boston, ~40% remote across US time zones). Roughly 220 paying customers. Average deal size $37K ACV, median 14 seats per account.

**Customer profile.** Mid-market consumer brands — DTC, retail, hospitality — with content marketing budgets between $500K and $5M. The strongest verticals are beauty, wellness, and food/beverage. Customers include several national chains, a wave of growing e-commerce brands, and a handful of media properties.

**The decision on the table.** The CEO, Marcus Tan, has been increasingly focused on international expansion. He believes the value proposition translates well to other markets and the addressable market in Europe alone is two to three times the US opportunity. He's asked the strategy team to put together a recommendation on whether — and how — to expand internationally in 2026.

**Constraints he's not waving away.**

- ContextCo has no international entity, no local hires, and no localized product (English-only UI; date and currency formatting are US-centric)
- Engineering bandwidth is limited; the team is heads-down on a major platform release in Q2 2026
- Cash runway is healthy (~28 months at current burn) but international investment will compress that meaningfully
- The board wants international revenue contribution to be at least 15% within 24 months of any expansion launch

## What we need from you

A 1-2 page strategic recommendation answering three questions:

1. **Should ContextCo expand internationally in 2026?** Yes, no, or "yes but later" — with reasoning.

2. **If yes, where first?** Pick one specific market (city or country) and explain why it's the right first move. Consider product-market fit, regulatory ease, talent availability, customer concentration, language constraints, and competitive landscape.

3. **What's the minimum-viable test you'd run before committing meaningful resources?** Describe a 90-day experiment that would generate enough signal to justify (or kill) a larger investment.

Constraints on your response:

- **800–1200 words.** Concise reasoning beats lengthy hedging.
- **Use a structure that's easy to scan.** Clear headings, bolded conclusions, bulleted lists where appropriate.
- **State your assumptions explicitly.** If you needed information that wasn't provided, name what you assumed and why.
- **Don't write a generic "expand to Europe" pitch.** Be specific about exactly where, exactly what to test, exactly what would convince you to scale or kill.

## Quality criteria

We evaluate on:

- **Decision quality.** Is the recommendation logically derived from the situation, or imposed on it? Could you defend this against pushback from the board?
- **Specificity.** "Expand to Europe" is a vibe. "Open with London because [three specific reasons], targeting [specific customer segment] via [specific channel]" is a decision.
- **Hidden assumptions surfaced.** Strong strategy work names its own load-bearing assumptions. Weak work hides them.
- **Counter-considerations addressed.** What's the strongest argument against your recommendation, and why does it not move you?
- **Clarity of writing.** Decision-makers don't have time to decode your prose. Get to the point. Use plain language.

## Submission

Paste your recommendation directly into the submission form below. Plain text or lightly-formatted markdown both work — the AI feedback will render either correctly.

Estimated time: 2-4 hours. Reading the context carefully and structuring your argument well take longer than typing the recommendation. Spend most of the time thinking, then write fast.$brief$
where slug = 'written-recommendation';


-- ─── Practice 2: pitch deck ────────────────────────────────────
update public.tasks
set
  title = 'Pitch deck: build a Seed fundraising deck for Lumio',
  submission_mode = 'link_only',
  category = 'deck',
  weight_strategy = 0.20,
  weight_execution = 0.15,
  weight_communication = 0.35,
  weight_technical = 0.05,
  weight_creativity = 0.25,
  estimated_time = '5-8 hours',
  brief = $brief$# Pitch deck: build a Seed fundraising deck for Lumio

Lumio is a fictional early-stage startup. Your task is to build a 10-12 slide investor pitch deck that an experienced operator would actually use to raise a $1.5M Seed round.

## About Lumio

**What it does.** Lumio is an AI-powered note-taking app for university students. It records lectures (with the lecturer's consent), generates structured notes in real-time, auto-organizes them by course and topic, and produces personalized study guides ahead of exams.

**Current state.**

- Built by a two-person founding team — technical CEO ex-Google, design-focused CTO ex-Notion
- Beta product live for 4 months at 3 universities
- 2,400 active users, 18% weekly active
- 340 paying users at $8/month after a 30-day free trial → $32K ARR
- 4.7/5 average rating in App Store and Play Store
- Featured in TechCrunch's "Tools for the AI-native generation" piece (October 2025)

**Why now.** AI-powered transcription quality crossed a critical threshold in early 2025 (Whisper-large-v3, Deepgram Nova-3). Students adopted ChatGPT for studying en masse but found it inadequate for source-grounded notes from their specific lectures. Lumio is the first product purpose-built for this gap.

**Competitive landscape.**

- **Notion** — general note-taking, not built for lectures, no audio capture
- **Otter.ai** — strong transcription, but raw output, not pedagogically useful
- **Goodnotes** — handwriting-focused, no AI
- **ChatGPT** — powerful but no lecture context

**The ask.** $1.5M Seed round at a $9M post-money cap (convertible note or SAFE). Use of funds: scale the engineering team to 5, launch on 20 additional campuses by end of 2026, build out the personalized study guide engine.

**The team's edges.** The CEO previously built and exited a small B2C AI startup (a $4M acquihire by a public company). The CTO led Notion's mobile design from 2022-2024. Both have decade-long relationships with their target audience from grad-school TA and tutoring roles.

## What we need from you

A 10-12 slide investor pitch deck that could plausibly be used in actual Seed conversations with US-based VCs (think Spark, First Round, Bain Capital Ventures, generic gen-AI-friendly Seed funds).

The deck must cover (in roughly this order — but feel free to reorder if your narrative is stronger that way):

1. **Vision / opening** — What's the one-line bet you're making?
2. **The problem** — Why now? Why is the current state broken?
3. **The product** — What is Lumio, with enough visual concreteness that the viewer "gets it" without reading 200 words
4. **Why now / market shift** — What's changed in the world that makes this possible
5. **Traction** — Make the numbers above feel like a curve, not a snapshot
6. **Business model** — How does this make money at scale?
7. **Market size** — Top-down (TAM/SAM/SOM) or bottom-up — your call, but it should add up
8. **Competition / why we win** — Position against the alternatives above
9. **Team** — Why this team, why now
10. **The ask** — Amount, terms, use of funds, milestones with that capital
11. **Closing slide** with contact info

You may add a roadmap, financial projection, customer testimonials, or founder narrative — but only if they strengthen the story, not just to add slides.

## Quality criteria

We evaluate on:

- **Story arc.** Does the deck tell one story with a clear protagonist (the problem) and resolution (Lumio)? Or is it a collection of facts?
- **Hook strength.** Does the first slide make us want to see slide 2?
- **Visual hierarchy.** Can a busy investor get the gist in 60 seconds by scanning headlines? Can they get the depth in 4 minutes by reading carefully?
- **Slide density.** No wall-of-text slides. Each slide makes one point well.
- **Numerical credibility.** Made-up numbers should feel internally consistent. A $1.5M raise at a $9M cap with $32K ARR should be defended by your narrative, not papered over.
- **Design polish.** This doesn't need to be a Pentagram-designed masterwork. It needs to feel intentional — consistent typography, defensible color palette, clean spacing.

## Submission

Build the deck in Google Slides, Figma, Keynote, or PowerPoint. Export to PDF and upload to one of:

- **Google Drive** (set sharing to "Anyone with the link can view")
- **Dropbox** (public link)
- **A personal site** if you have one

Submit the link below. Verify it's accessible without login by opening it in an incognito tab.

If you built it in Figma or Pitch and want to share the editable link too, include that as a secondary link in your submission notes — but the primary deliverable is the PDF.

Estimated time: 5-8 hours for a strong deck. The thinking (positioning, story, narrative arc) takes longer than the design itself.$brief$
where slug = 'pitch-deck';


-- ─── Practice 3: code project ──────────────────────────────────
update public.tasks
set
  title = 'Code project: build and ship a small working tool',
  submission_mode = 'link_only',
  category = 'code',
  weight_strategy = 0.10,
  weight_execution = 0.25,
  weight_communication = 0.15,
  weight_technical = 0.40,
  weight_creativity = 0.10,
  estimated_time = '4-8 hours',
  brief = $brief$# Code project: build and ship a small working tool

This is a show-don't-tell task. Pick one project from the options below, build it, deploy it (if applicable), and submit a link to the working code plus a brief decisions writeup.

## Pick one

You may choose any ONE of these to build. They're scoped to be 4-8 hours of work for a competent early-career developer. Use whatever stack you're strongest in — we care about the result and the craft, not the language.

### Option A — Personal habit tracker (CLI or web)

Build an app where the user can:
- Define daily habits (e.g., "Exercise 30 min", "Read 20 pages")
- Log completion each day with a single command or click
- See streak counts and weekly completion rates
- Export their history to CSV

Bonus credit for: SQLite or local file persistence, clean CLI argument parsing OR responsive web UI, sensible error handling.

### Option B — Personal URL shortener with analytics

Build a service that:
- Takes a long URL and produces a short link (e.g., `yourdomain.com/abc`)
- Tracks clicks per link with timestamp and rough geo (just IP-based country, no fingerprinting)
- Shows a simple analytics page per link

Bonus credit for: rate limiting, password-protected analytics view, custom slug option.

### Option C — Markdown blog engine

Build a static-site-generator that:
- Reads markdown files from a directory
- Renders them to clean HTML with consistent styling
- Generates an index page listing posts in reverse chronological order
- Supports basic frontmatter (title, date, tags)

Bonus credit for: syntax highlighting, RSS feed, deploy-on-push setup (Vercel/Netlify).

### Option D — Pomodoro timer with session history

Build a Pomodoro timer (web preferred) that:
- Lets the user start a 25-minute work session followed by a 5-minute break
- Persists session history in localStorage
- Shows daily and weekly stats — total focus time, sessions completed

Bonus credit for: keyboard shortcuts, sound notifications (toggleable), data visualization of session history.

## What we need from you

Three deliverables:

1. **Working code.** A GitHub repository (public, or shared with `reviewers@runeships.com`) containing your code, a README, and instructions for running it locally.

2. **Deployed version (web projects only).** Web projects should be deployed somewhere accessible. Vercel, Netlify, Railway, fly.io, Render — all free for projects this size. CLI projects just need the README.

3. **Decisions writeup.** In the repo's README, include a 200-400 word section titled **"Decisions and tradeoffs"** where you explain:
   - Why you picked this language and framework over alternatives
   - One tradeoff you made and why (e.g., "I chose to skip user accounts for v1 because…")
   - What you'd build next if you had another 4 hours

## Quality criteria

We evaluate on:

- **Does it work?** Tests pass, deployed URL loads, CLI runs without crashing. This is table stakes — most weak submissions fail here.
- **Code organization.** Files are logically separated, naming is clear, dependencies are minimal and justified.
- **Error handling.** What happens when input is invalid, network is down, file doesn't exist? Graceful failure beats clever success.
- **Documentation.** Can a stranger clone your repo and run it in under 5 minutes following the README?
- **Decision quality (the writeup).** Are your choices defended, or just made? Did you consider alternatives, or grab the first thing?
- **Polish.** Web UIs aren't expected to look like a Vercel landing page, but they shouldn't look like uncss'd default HTML. CLIs should have helpful `--help` output and useful error messages.

## Submission

Submit a single link to your GitHub repository (or self-hosted git equivalent).

The repo MUST contain:

- The working code
- A README with setup instructions, the "Decisions and tradeoffs" writeup, and (for web projects) the deployed URL

We will: clone your repo, read the README, run the code (or visit the deployed URL), and skim the code for organization and craft.

Don't submit a private repo unless you've shared it with `reviewers@runeships.com`. Don't submit a half-finished local-only project — if it's not in version control and runnable, it didn't ship.

Estimated time: 4-8 hours depending on the option and your familiarity with the stack.$brief$
where slug = 'code-project';


-- ─── Practice 4: financial model ───────────────────────────────
update public.tasks
set
  title = 'Financial model: build a 3-year P&L for FieldNote (B2B SaaS)',
  submission_mode = 'link_only',
  category = 'spreadsheet',
  weight_strategy = 0.25,
  weight_execution = 0.25,
  weight_communication = 0.10,
  weight_technical = 0.35,
  weight_creativity = 0.05,
  estimated_time = '4-7 hours',
  brief = $brief$# Financial model: 3-year P&L for FieldNote

Build a 3-year financial model for FieldNote — a fictional early-stage SaaS company. The output should be the kind of model a CFO or founder would actually use to plan hiring, fundraising, and runway scenarios.

## About FieldNote

**What it does.** FieldNote is software for field service teams — HVAC installers, electricians, residential cleaning companies. The platform handles job scheduling, technician routing, invoicing, and customer communication. It replaces the spreadsheet-plus-text-messages combo that most small field-service businesses use today.

**Current state (December 2025).**

- **Founded** March 2024
- **Stage** Just raised $2.5M Seed (closed November 2025)
- **Current ARR** $215,000
- **Customers** 48 paying companies
- **Average ACV** $4,500
- **Gross monthly logo churn** ~2%
- **Net dollar retention** 108%
- **Headcount** 6 — 3 engineering, 1 design, 1 sales, 1 founder/CEO
- **Cash on hand** $2.7M (Seed plus remaining bootstrap)
- **Monthly burn** $95K

**Product-market signal.** Post-PMF — organic referrals account for 35% of new logos, NPS is 68, the sales cycle has compressed from 11 weeks (early 2025) to 5 weeks (Q4 2025).

**Pricing tiers.**

- **Starter** $79/month, up to 3 technicians
- **Professional** $249/month, up to 10 technicians, route optimization
- **Business** $599/month, unlimited technicians, API access, premium support

Current customer mix: ~40% Starter, 45% Professional, 15% Business.

**Strategic priorities for 2026.**

- Scale go-to-market — current single salesperson can't service inbound pipeline; CEO wants to scale to 4 AEs plus 2 SDRs
- Launch the Business-tier API as a separately priced layer
- Maintain gross margin above 75%
- End 2026 with at least 18 months of runway at any point during 2027

## What we need from you

Build a 3-year financial model with **monthly granularity** in Excel or Google Sheets. The model should let the CEO ask "what happens if…" questions and get answers without redoing the math.

### Required tabs

1. **Assumptions** — All inputs the model is built on. Growth rates, pricing, headcount, costs, churn. Cleanly labeled and color-coded.
2. **Revenue** — Monthly revenue projection by tier. New logos, churned logos, expansion ARR, end-of-month ARR. All driven by formulas referencing Assumptions.
3. **Headcount & payroll** — Planned hiring by month and function. Salary assumptions per role. Total compensation including benefits and taxes.
4. **Operating expenses** — All non-payroll costs: hosting, software, marketing, sales commissions, professional services, office, other. Reasonable for a 6-30 person SaaS company.
5. **P&L Summary** — Monthly P&L showing revenue, COGS, gross profit, gross margin %, OpEx by category, EBITDA, EBITDA margin. Quarterly and annual roll-ups.
6. **Cash flow & runway** — Monthly cash position. Starting cash, monthly EBITDA, working capital changes (basic), ending cash. Months of runway remaining at each point.
7. **Scenarios** — At minimum three scenarios you can toggle between: **base case**, **bull case** (revenue 30% above base, costs in line), **bear case** (revenue 30% below base, costs 10% above base for catch-up hiring).

### Quality criteria

- **All formulas, no hardcoded outputs.** If you copy-paste a calculated value, you've broken the model.
- **No formula errors.** No `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A` visible anywhere. Use `IFERROR` / `IF` where appropriate.
- **Color-coded inputs vs formulas.** Industry standard: blue for hardcoded inputs, black for formulas, green for cross-sheet references.
- **Number formatting consistency.** Currency, percentages, multiples — formatted to industry standard. No raw decimals like 0.732891.
- **Sensible assumptions.** A model can be mechanically correct and substantively absurd. Defend your growth rate, your CAC, your headcount ramp.
- **Scenario toggle that actually works.** Switching scenarios should propagate through the entire model via a single input change.

### Bonus credit

- Customer cohort analysis tab showing retention curves
- Burn multiple calculation by quarter
- Sensitivity table for end-of-year-3 ARR across two key variables
- A one-page executive summary tab the CEO could present to her board

## Submission

Upload the completed model to Google Drive (Sheets or Excel format) or Microsoft OneDrive. Set sharing to "Anyone with the link can view." Make sure formulas remain inspectable — readers should be able to click into any cell and see the formula underneath, not just the computed value.

Submit the link below.

Estimated time: 4-7 hours. The thinking (assumption setting, scenario design) takes more time than the typing.$brief$
where slug = 'financial-model';
