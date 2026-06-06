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
- NO card-based layouts
- NO emoji icons
- NO numbered "How it works" steps
- Small abstract Elder Futhark runic marks as section dividers only
- Mobile-first: 375px min, 1280px+ desktop

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
