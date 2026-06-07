import { Wordmark } from "@/components/Wordmark";
import { RuneMark } from "@/components/RuneMark";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { CompanyDialog } from "@/components/CompanyDialog";

export default function Home() {
  return (
    <>
      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <header className="px-6 sm:px-10 md:px-16 pt-7 sm:pt-9">
        <nav
          aria-label="Primary"
          className="mx-auto max-w-[1240px] flex items-center justify-between"
        >
          <Wordmark />
          <a
            href="#companies"
            className="text-[14px] tracking-[0.01em] text-muted hover:text-ink transition-colors duration-200 ease-out"
          >
            For companies <span aria-hidden>→</span>
          </a>
        </nav>
      </header>

      <main className="px-6 sm:px-10 md:px-16">
        {/* ─── 1. HERO ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-headline"
          className="mx-auto max-w-[1240px] pt-24 sm:pt-32 md:pt-40 pb-28 sm:pb-40"
        >
          <div className="grid grid-cols-12 gap-x-6 gap-y-10 md:gap-y-14">
            <Reveal mode="load" delay={0.05} className="col-span-12 lg:col-span-11">
              <h1
                id="hero-headline"
                className="font-display font-light tracking-[-0.022em] leading-[0.98] text-ink"
                style={{
                  fontSize: "var(--text-display)",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                You need experience to get experience.
                <span className="block mt-2 sm:mt-3 text-oxblood italic font-normal">
                  We broke the loop.
                </span>
              </h1>
            </Reveal>

            <Reveal
              mode="load"
              delay={0.22}
              className="col-span-12 md:col-span-9 lg:col-span-7 lg:col-start-5"
            >
              <p className="text-[18px] sm:text-[20px] md:text-[22px] leading-[1.45] text-ink/80 max-w-[36ch]">
                RuneShips is where freshmen and sophomores prove they can do
                real business work — by actually doing it, for real companies.
                Build a reputation before anyone gives you the chance.
              </p>
            </Reveal>

            <Reveal
              mode="load"
              delay={0.38}
              className="col-span-12 lg:col-span-9 mt-2"
            >
              <WaitlistForm source="landing_hero" id="hero" />
              <p className="mt-5 text-[13px] tracking-[0.02em] text-muted">
                Free for students. Always.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── 2. THE EXPERIENCE TRAP ──────────────────────────────── */}
        <Section runeChar="ᚱ" runeLabel="Raidho — journey, breaking the cycle">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-5">
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[14ch]"
                style={{ fontSize: "var(--text-section)" }}
              >
                Skip the experience trap. Prove what you can do.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
              <p>
                The system is closed at the front door. Every résumé screen for
                an entry-level internship asks for prior internship experience
                — preferably at a name-brand firm — that almost no freshman or
                sophomore can have yet. The qualification it filters for is the
                qualification it refuses to let you earn.
              </p>
              <p>
                What replaces a real evaluation is a credential lottery: which
                high school you went to, which adults knew your parents, which
                on-campus club let you in. None of those measure how well you
                actually think through a financial model, dissect a competitor,
                or write a one-page memo a partner would forward without
                editing.
              </p>
              <p>
                The alternative isn&rsquo;t more applications. It&rsquo;s a way
                to prove the work directly, get real feedback within minutes,
                and walk away with a record that doesn&rsquo;t depend on anyone
                vouching for you. The work is the credential.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── 3. SAMPLE TASK ───────────────────────────────────────── */}
        <Section runeChar="ᚲ" runeLabel="Kenaz — knowledge, craft, mastery">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink"
                style={{ fontSize: "var(--text-section)" }}
              >
                A task on RuneShips, in detail.
              </h2>
            </div>
          </div>

          <article className="grid grid-cols-12 gap-x-6 mt-16 sm:mt-20">
            <div className="col-span-12 md:col-span-4">
              <p className="text-[12px] tracking-[0.14em] uppercase text-muted">
                Assignment 001 · Strategy
              </p>
            </div>

            <div className="col-span-12 md:col-span-8 mt-3 md:mt-0">
              <h3
                className="font-display font-normal tracking-[-0.012em] leading-[1.1] text-ink"
                style={{ fontSize: "clamp(1.55rem, 1.6vw + 1rem, 2.25rem)" }}
              >
                Pitch deck teardown — Series A SaaS company, fintech vertical.
              </h3>

              <div className="prose-editorial mt-7 max-w-[62ch] text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
                <p>
                  A B2B fintech company is preparing for a $12M Series A. Their
                  current deck has a strong product story but the market sizing
                  slide undersells the TAM and the competitive positioning
                  feels generic.
                </p>
                <p>
                  Submit a revised deck (or a written critique) showing: a
                  tighter TAM/SAM/SOM breakdown, sharper competitive
                  positioning, and a recommendation on the financial
                  projections slide.
                </p>
              </div>

              <hr className="mt-10 border-0 border-t border-rule" />

              <dl className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-y-5 sm:gap-x-8">
                <MetaItem
                  term="Skills tested"
                  value="Strategy · Finance · Product · Communication"
                />
                <MetaItem term="Time" value="~3–5 hours" />
                <MetaItem
                  term="AI feedback"
                  value="~5 minutes after submission"
                />
              </dl>

              <p className="mt-10 max-w-[62ch] text-[14px] leading-[1.6] text-muted italic">
                AI generates personalized written feedback within minutes of
                submission. Strong submissions earn points toward your portable
                skill rank — visible to recruiters across every task
                you&rsquo;ve done.
              </p>
            </div>
          </article>
        </Section>

        {/* ─── 4. FOUNDER STORY ─────────────────────────────────────── */}
        <Section runeChar="ᛟ" runeLabel="Othala — heritage, origin, first-person">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-5">
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[12ch]"
                style={{ fontSize: "var(--text-section)" }}
              >
                Why this exists.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
              <p>
                I applied to forty internships my freshman year. I made it past
                the résumé screen for two. Both interviewers were polite, but
                the conversations were the same: &ldquo;this would be a stretch
                — most of our interns are juniors who already had a finance
                internship sophomore summer.&rdquo; The qualification I needed
                was the qualification the application was supposed to be for.
              </p>
              <p>
                Watching the people who did get in, I noticed most of them
                weren&rsquo;t more capable than the people who didn&rsquo;t —
                they were more visible. A parent at the firm. A target school
                with on-campus recruiting that front-loaded the funnel. They
                had been pre-sorted before anyone read a single word
                they&rsquo;d written. The credential gate isn&rsquo;t a quality
                filter. It&rsquo;s a proxy for who was introduced to the right
                person early.
              </p>
              <p>
                The fix has to be a way to prove the work directly — before
                anyone hands you a job to do it on. RuneShips is that. Real
                tasks from real companies. Written feedback in minutes, not
                weeks. A record that follows you across submissions and lands
                in front of recruiters, regardless of which dorm you live in.
              </p>
              <p className="text-[14px] tracking-[0.02em] text-muted not-italic">
                — Diego Marjotie, founder
              </p>
            </div>
          </div>
        </Section>

        {/* ─── 5. FOR COMPANIES ─────────────────────────────────────── */}
        <Section
          id="companies"
          runeChar="ᛏ"
          runeLabel="Tiwaz — honor, recruitment, signal"
        >
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-5">
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[15ch]"
                style={{ fontSize: "var(--text-section)" }}
              >
                For companies hiring early-career talent.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
              <p>
                Posting a task on RuneShips is recruiting, not work
                outsourcing. You&rsquo;re not collecting deliverables to ship
                — you&rsquo;re getting a transparent read on how a candidate
                frames an ambiguous problem, what they reach for first, where
                their thinking breaks down. The point is the audit trail, not
                the artifact.
              </p>
              <p>
                For an early-career talent funnel, this gets you signal earlier
                and from further out: candidates beyond the same five target
                schools, sophomores you&rsquo;d otherwise never see until
                they&rsquo;re already someone else&rsquo;s hire, and an
                employer-brand surface that thousands of motivated students opt
                into voluntarily. Treat it like an open-book case interview
                that runs all semester, with the candidates who self-select
                for it.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-6 mt-14 sm:mt-20">
            <div className="col-span-12 md:col-span-6 md:col-start-7 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
              <CompanyDialog />
              <p className="text-[13px] leading-[1.55] text-muted max-w-[36ch]">
                We&rsquo;re onboarding pilot company partners. Tell us what
                tasks you&rsquo;d post and we&rsquo;ll set it up.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── 6. CLOSING ───────────────────────────────────────────── */}
        <section
          aria-labelledby="closing-tag"
          className="mx-auto max-w-[1240px] border-t border-rule pt-28 sm:pt-36 pb-20 sm:pb-28"
        >
          <Reveal mode="scroll">
            <div className="grid grid-cols-12 gap-x-6">
              <div className="col-span-12 md:col-span-10">
                <RuneMark
                  rune="ᛒ"
                  label="Berkano — growth, the visible outcome"
                  className="!text-[22px]"
                />
                <p
                  id="closing-tag"
                  className="mt-7 font-display font-light tracking-[-0.022em] leading-[0.98] text-ink"
                  style={{
                    fontSize: "var(--text-closing)",
                    fontVariationSettings: '"opsz" 144',
                  }}
                >
                  Show your work.
                  <span className="block text-oxblood italic font-normal">
                    Earn your ships.
                  </span>
                </p>
                <div className="mt-14 sm:mt-20">
                  <Wordmark size="md" asLink={false} />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="px-6 sm:px-10 md:px-16 pb-10">
        <div className="mx-auto max-w-[1240px] pt-7 border-t border-rule flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[12px] tracking-[0.04em] text-muted">
            © 2026 RuneShips
            <span aria-hidden className="mx-2.5 text-muted/60">·</span>
            <a
              href="mailto:hello@runeships.com"
              className="hover:text-ink transition-colors duration-200 ease-out"
            >
              hello@runeships.com
            </a>
            <span aria-hidden className="mx-2.5 text-muted/60">·</span>
            <a
              href="/privacy"
              className="hover:text-ink transition-colors duration-200 ease-out"
            >
              Privacy
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Local layout primitives. Kept inside page.tsx because they're only
 * used by this page — extract to /components/ if reused elsewhere.
 * ────────────────────────────────────────────────────────────────────── */

type SectionProps = {
  id?: string;
  runeChar: string;
  runeLabel: string;
  children: React.ReactNode;
};

/**
 * Editorial section frame: hairline rule on top, a single rune kicker,
 * generous vertical air. No card, no shadow — the whitespace is the
 * separator. Content fades in on scroll as one unit.
 */
function Section({ id, runeChar, runeLabel, children }: SectionProps) {
  return (
    <section
      id={id}
      className="mx-auto max-w-[1240px] border-t border-rule pt-20 sm:pt-28 pb-24 sm:pb-32"
    >
      <Reveal mode="scroll">
        <div className="mb-12 sm:mb-16">
          <RuneMark rune={runeChar} label={runeLabel} />
        </div>
        {children}
      </Reveal>
    </section>
  );
}

function MetaItem({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] tracking-[0.14em] uppercase text-muted">
        {term}
      </dt>
      <dd className="mt-1.5 text-[15px] leading-[1.45] text-ink">{value}</dd>
    </div>
  );
}
