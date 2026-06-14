# RuneShips — Project Context for Claude Code

## What RuneShips Is
A platform where real companies post real business tasks (market sizing, 
marketing briefs, pitch deck teardowns, financial models, product 
critiques) and any student can submit. AI generates personalized 
feedback in minutes. Performance accumulates into a portable, 
recruiter-trusted skill rank. Free for students, free for companies 
to post, paid recruiter access tier.

**Target wedge:** freshmen and sophomores locked out of traditional 
internships by the "you need experience to get experience" trap.

**Primary thesis:** the credential gatekeeping system can be bypassed 
by real work + AI feedback at scale + portable cross-company 
reputation.

## Tech Stack
- Next.js 15.5.x, App Router, TypeScript, Tailwind CSS v4
- Vercel hosting (auto-deploys from main branch)
- Supabase for DB/Auth/Storage (RLS enabled by default on all tables)
- Anthropic API for feedback (default: claude-haiku-4-5, max_tokens 
  800) via lib/anthropic.ts
- Resend for transactional email
- motion (formerly framer-motion) for animations — use sparingly

## File Structure
- app/ — pages and routes (App Router)
- components/ — reusable UI
- lib/ — clients and helpers (supabase, anthropic, resend)
- db/migrations/ — schema as numbered SQL files
- .env.local — secrets (gitignored, NEVER commit)
- .env.local.example — env shape template (committed)

## Frontend Website Rules — "Editorial Minimal"

**Visual direction:** confident, editorial, restrained. 
Bloomberg-Terminal-meets-Substack. NOT a SaaS landing page. NOT 
RPG/fantasy aesthetic.

**Color:**
- Background: cream/off-white (~#FAFAF7)
- Text: near-black
- Single deep accent (oxblood, ink black-blue, or deep bronze)
- NEVER: purple, gradients, box shadows, bright "AI startup" cyan

**Typography:**
- Display: editorial serif (GT Sectra, Tiempos Headline, or system 
  serif fallback)
- Body: clean modern sans (Switzer, Söhne, General Sans)
- EXCLUDED: Inter, Roboto, Arial, system-ui, Space Grotesk

**Layout:**
- Generous whitespace, asymmetric grid
- NO card-based layouts on MARKETING pages (/, /proof, /story, 
  /privacy). APP pages (/dashboard, /tasks/*, /submissions/*, 
  /onboarding) may use editorial-style cards where they serve 
  scannability — but cards must use hairline borders only, no shadows, 
  no aggressive rounded corners (4px max), restrained iconography.
- NO emoji icons
- NO numbered "How it works" steps
- Small abstract Elder Futhark runic marks as section dividers only
- Mobile-first: 375px min, 1280px+ desktop

**Task conventions:**
- Task categories (used for icons + filtering): writing, deck, code, 
  spreadsheet, strategy, design. Each has a fixed Lucide icon mapping 
  defined in components/TaskCard.tsx.

**Motion:**
- Subtle fade-in on scroll for sections
- 200-300ms ease on interactive elements
- No bouncy springs, no parallax, no scroll-jacking

## Copy Voice
- Confident, direct, slightly contrarian — not corporate
- No startup-bro language ("disrupt", "revolutionize", "synergy")
- No false humility ("we're just trying to...")
- Hero headline locked: "You need experience to get experience. 
  We broke the loop."
- Closing tagline locked: "Show your work. Earn your ships."

## Database Conventions
- Every new table gets RLS enabled by default
- INSERT-only policies for the anon role unless explicitly stated
- Sensitive operations use service_role key in server actions only
- All migrations as numbered SQL files in db/migrations/

## Anthropic API Conventions
- Default model: claude-haiku-4-5
- Default max_tokens: 800
- Override per call when Sonnet is needed
- Spending cap $10/month at the console, auto-reload disabled

## Constraints / Don't Do
- Don't import server-only modules (service_role client, anthropic 
  client) from Client Components
- Don't add console.log to production code
- Don't paste secrets in chat — use env vars only
- Don't auto-run feedback model on every page load (cost discipline)
- Don't build features outside the current phase roadmap

## Skills & MCPs in Use
- frontend-design (Anthropic) — visual identity, anti-generic-SaaS
- ui-ux-pro-max — palettes, font pairings, layout patterns
- 21st.dev "Magic" MCP — reference patterns only, re-shape to 
  Editorial Minimal

## How to Keep This File Updated
When we add a new piece of infrastructure, change a convention, 
or lock a new design decision, append it here. Outdated CLAUDE.md 
is worse than no CLAUDE.md. Treat it as living project memory — 
end of every session, ask: "Is there anything I learned this 
session that should go in CLAUDE.md?"

## Phase 2A — Platform MVP (Student-facing)

### Scope
- Student-facing limited platform that demonstrates the core loop: 
  sign up → see tasks → submit → AI feedback → submission history
- Tasks are hardcoded for now (no admin interface)
- Companies are owned: Godly, myOrbit, Veganuño, plus practice tasks
- Validates load-bearing assumption #1: AI grading reliability

### Auth
- Method: Supabase magic-link only (no password)
- Onboarding collects: name, school, graduation year, intended 
  career track (multi-select), self-rated initial skills (5 sliders 
  0–100)

### Skill dimensions (the 5 axes — used for radar charts, AI scoring, 
ranking, onboarding sliders)
1. Strategy — analytical thinking, problem framing
2. Execution — quality, completeness, attention to detail
3. Communication — clarity, structure, writing/presentation
4. Technical — appropriate use of tools, code, data, calculations
5. Creativity — original insight, novel framing

Every task scores submissions across all 5 dimensions. Tasks weight 
dimensions differently. User profiles aggregate scores per dimension. 
Display as pentagon/radar charts (like FIFA player cards).

### Submission system
- Three submission modes per task:
  - text_only
  - link_only
  - text_and_link
- Form dynamically renders fields based on the task's mode:
  - submission_title (always)
  - submission_body textarea (when text required)
  - supporting_link URL input (when link required)
  - "I confirm this link is viewable by anyone with the link" 
    checkbox (when link required)
- NO file uploads yet
- Use link_only or text_and_link for: spreadsheet models, slide 
  decks, dashboards, design mockups, code repos
- Use text_only or text_and_link for: written analysis tasks

### Submissions table schema (canonical)
- id, user_id, task_id, submission_title, submission_body, 
  supporting_link, link_access_confirmed, created_at
- Multiple submissions per task allowed, but 24-hour cooldown 
  between submissions on the same task (anti-spam, encourages 
  iteration not gaming)
- Profile shows ALL submissions; ranking uses BEST scored 
  submission per task

### AI feedback
- Sync generation (student waits with loading state)
- Anthropic API, Haiku 4.5, max_tokens 800 (per existing CLAUDE.md 
  Anthropic conventions)
- Output: per-dimension scores (0–100) + qualitative written 
  feedback
- Stored in a separate feedback table linked to submission

### Initial tasks (7 total)
- Practice 1: written recommendation
- Practice 2: pitch deck presentation
- Practice 3: small code project / GitHub link
- Practice 4: organized spreadsheet with values
- Company 1: Godly (brief drafted in Prompt 1)
- Company 2: myOrbit (brief drafted in Prompt 1)
- Company 3: Veganuño (brief drafted in Prompt 1)


## AI grader calibration anchors

The AI grader's per-dimension scoring uses this calibrated scale (defined in `app/actions/generateFeedback.ts`):

| Band | Range | Meaning |
|---|---|---|
| Broken or absent | 0-15 | Gibberish or fundamental misunderstanding |
| Severely underdeveloped | 16-35 | Critical errors of reasoning, structure, or judgment |
| Below average | 36-55 | Materially weaker than averagely competent |
| Average to competent | 56-70 | Solid baseline. Most AI-baseline output lands here |
| Above average / solid | 71-82 | Thoughtful, specific, hidden assumptions surfaced |
| Strong / impressive | 83-90 | Beyond competent — judgment, counter-considerations |
| Exceptional | 91-95 | Contrarian framings supported by rigor; non-obvious considerations |
| Distinguished | 96-100 | Rare; instructive to a senior practitioner |

Old prompt: "50 = average, 70 = strong, 85+ = exceptional" — compressed the top 25 points into 13 points of actual usage. New scale widens the dynamic range so exceptional work reliably reaches 88-94.

### Reference submissions for calibration testing

Run `pnpm tsx scripts/test-grader-calibration.ts` after any prompt change.

| Benchmark | Expected weighted total | What it tests |
|---|---|---|
| `garbage` ("asdf asdf qwerty") | 0-15 | Bottom-end behavior unchanged |
| `chatgpt-baseline` (well-prompted GPT output, no editing) | 65-78 | AI baseline stays in the competent band |
| `toronto-exceptional` (contrarian pick + named numbers + kill thresholds + counter-argument) | 88-94 | Top-end dynamic range opens up |

If `chatgpt-baseline` drifts to 80+, the calibration over-inflated and needs tightening. If `toronto-exceptional` stays below 88, the calibration didn't take.
