import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { RuneOpener } from "@/components/RuneOpener";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { ProfileMockup } from "@/components/ProfileMockup";
import { HowItWorks } from "@/components/HowItWorks";
import { StatStrip } from "@/components/StatStrip";
import { TaskCard } from "@/components/TaskCard";
import { FeedbackPreview } from "@/components/FeedbackPreview";
import { AudienceTabs } from "@/components/AudienceTabs";
import { CredibilityList } from "@/components/CredibilityList";
import { PullQuote } from "@/components/PullQuote";

export default function Home() {
  return (
    <main>
      {/* ─── 1. HERO — cream ────────────────────────────────────── */}
      <section
        aria-labelledby="hero-headline"
        className="bg-cream"
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
          <div className="grid grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-14 lg:gap-y-0 items-start">
            {/* LEFT — 60% on desktop */}
            <div className="col-span-12 lg:col-span-7">
              <Reveal mode="load" delay={0.05}>
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

              <Reveal mode="load" delay={0.20} className="mt-7 sm:mt-9">
                <p className="text-[18px] sm:text-[20px] leading-[1.5] text-ink/80 max-w-[42ch]">
                  RuneShips lets students complete real company tasks, get AI
                  feedback in minutes, and build a public skill rank recruiters
                  can trust.
                </p>
              </Reveal>

              <Reveal mode="load" delay={0.30} className="mt-5">
                <p className="text-[13px] leading-[1.6] text-muted max-w-[46ch]">
                  Free for students. Companies post tasks for free. Recruiters
                  pay to find proven early-career talent.
                </p>
              </Reveal>

              <Reveal
                mode="load"
                delay={0.42}
                id="waitlist"
                className="mt-9 scroll-mt-28"
              >
                <WaitlistForm source="landing_hero" id="hero" />
              </Reveal>

              <Reveal mode="load" delay={0.52} className="mt-6">
                <Link
                  href="#companies"
                  className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
                >
                  Post a pilot task <span aria-hidden className="ml-1">→</span>
                </Link>
              </Reveal>
            </div>

            {/* RIGHT — 40% on desktop */}
            <div className="col-span-12 lg:col-span-5 lg:pl-4">
              <Reveal mode="load" delay={0.30}>
                <ProfileMockup />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. HOW IT WORKS + STATS — parchment ────────────────── */}
      <section
        id="how-it-works"
        className="bg-parchment border-t border-oxblood/40 scroll-mt-28"
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᚱ"
              name="Raidho"
              meaning="journey, the path forward"
            />
            <h2
              className="mt-14 sm:mt-16 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center max-w-[18ch] mx-auto"
              style={{ fontSize: "var(--text-section)" }}
            >
              How RuneShips works.
            </h2>
            <div className="mt-14 sm:mt-20">
              <HowItWorks />
            </div>
          </Reveal>
        </div>

        {/* Stat strip — still parchment, separated by an oxblood hairline */}
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-16 sm:pt-20 pb-24 sm:pb-32">
          <hr className="border-0 border-t border-oxblood/30 mb-14 sm:mb-20" />
          <Reveal mode="scroll">
            <StatStrip />
          </Reveal>
        </div>
      </section>

      {/* ─── 3. THE EXPERIENCE TRAP — cream ─────────────────────── */}
      <section className="bg-cream border-t border-oxblood/40">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᚾ"
              name="Nauthiz"
              meaning="constraint, the closed door"
            />
            <div className="mt-14 sm:mt-16 grid grid-cols-12 gap-x-6 gap-y-10">
              <div className="col-span-12 md:col-span-5">
                <h2
                  className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[14ch]"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  Skip the experience trap.
                </h2>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] text-ink/85">
                <p>
                  The system is closed at the front door. Every entry-level
                  internship asks for prior internship experience — preferably
                  at a name-brand firm — that almost no freshman or sophomore
                  can have yet. The qualification it filters for is the
                  qualification it refuses to let you earn.
                </p>
                <p>
                  The fix isn&rsquo;t more applications. It&rsquo;s a way to
                  prove the work directly, get real feedback, and walk away
                  with a record that doesn&rsquo;t depend on anyone vouching
                  for you.{" "}
                  <span className="text-ink">The work is the credential.</span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 4. PULL QUOTE 1 — cream ─────────────────────────────── */}
      <PullQuote bg="cream">The work is the credential.</PullQuote>

      {/* ─── 5. SAMPLE TASK + FEEDBACK PREVIEW — cream ──────────── */}
      <section className="bg-cream border-t border-oxblood/40">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᛗ"
              name="Mannaz"
              meaning="the individual, your own work"
            />
            <h2
              className="mt-14 sm:mt-16 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center max-w-[18ch] mx-auto"
              style={{ fontSize: "var(--text-section)" }}
            >
              A task on RuneShips.
            </h2>
            <div className="mt-14 sm:mt-18 max-w-[1080px] mx-auto">
              <TaskCard />
            </div>

            <div className="mt-14 sm:mt-20 max-w-[1080px] mx-auto">
              <FeedbackPreview />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 6. AUDIENCE TABS — parchment ───────────────────────── */}
      <section className="bg-parchment border-t border-oxblood/40">
        {/* Anchors for the nav. AudienceTabs reads the hash on mount. */}
        <span id="students" aria-hidden className="block scroll-mt-28" />
        <span id="companies" aria-hidden className="block scroll-mt-28" />

        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᚦ"
              name="Thurisaz"
              meaning="the gate, the threshold of decision"
            />
            <h2
              className="mt-14 sm:mt-16 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center max-w-[16ch] mx-auto"
              style={{ fontSize: "var(--text-section)" }}
            >
              Two sides. One system.
            </h2>
            <div className="mt-14 sm:mt-18">
              <AudienceTabs />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 7. PULL QUOTE 2 — parchment ────────────────────────── */}
      <PullQuote bg="parchment">
        Prove the work before anyone gives you the job.
      </PullQuote>

      {/* ─── 8. CREDIBILITY — parchment ─────────────────────────── */}
      <section className="bg-parchment border-t border-oxblood/40">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᛉ"
              name="Algiz"
              meaning="protection, trust, the standard"
            />
            <div className="mt-14 sm:mt-16 grid grid-cols-12 gap-x-6 gap-y-10">
              <div className="col-span-12 md:col-span-5">
                <h2
                  className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[15ch]"
                  style={{ fontSize: "var(--text-section)" }}
                >
                  Why the rank is trustworthy.
                </h2>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] text-ink/85">
                <p>
                  A rank is only useful if it&rsquo;s hard to fake and hard to
                  flatter. RuneShips treats every submission as evidence to
                  weigh, not a participation log. Six things keep it honest:
                </p>
              </div>
            </div>

            <div className="mt-14 sm:mt-16">
              <CredibilityList />
            </div>

            <div className="mt-12 sm:mt-14">
              <Link
                href="/proof"
                className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
              >
                Read our full evaluation methodology{" "}
                <span aria-hidden className="ml-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 9. FOUNDER NOTE — cream ─────────────────────────────── */}
      <section className="bg-cream border-t border-oxblood/40">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᛟ"
              name="Othala"
              meaning="heritage, the story you carry"
            />
            <h2
              className="mt-14 sm:mt-16 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center max-w-[20ch] mx-auto"
              style={{ fontSize: "var(--text-section)" }}
            >
              A note from the founder.
            </h2>

            <div className="mt-12 sm:mt-14 grid grid-cols-12 gap-x-6">
              <div className="col-span-12 md:col-span-9 md:col-start-3 lg:col-span-8 lg:col-start-3 pl-6 sm:pl-8 border-l-2 border-oxblood">
                <p className="font-display font-light italic text-[20px] sm:text-[22px] leading-[1.5] text-ink/90 max-w-[50ch]">
                  I applied to 40 internships freshman year. I made it past two
                  résumé screens. The issue wasn&rsquo;t ability — it was
                  visibility. RuneShips exists so students can prove the work
                  before anyone gives them the job.
                </p>
                <p className="mt-6 text-[14px] tracking-[0.02em] text-muted">
                  — Diego, founder
                </p>
                <div className="mt-7">
                  <Link
                    href="/story"
                    className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
                  >
                    Read the full story{" "}
                    <span aria-hidden className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── 10. CLOSING — inverted, ink bg ─────────────────────── */}
      <section
        aria-labelledby="closing-tag"
        className="bg-ink text-cream border-t border-oxblood"
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32">
          <Reveal mode="scroll">
            <RuneOpener
              rune="ᛞ"
              name="Dagaz"
              meaning="daybreak, a new beginning"
            />
            <p
              id="closing-tag"
              className="mt-14 sm:mt-16 font-display font-light tracking-[-0.022em] leading-[0.98] text-cream text-center max-w-[14ch] mx-auto"
              style={{
                fontSize: "var(--text-closing)",
                fontVariationSettings: '"opsz" 144',
              }}
            >
              The work is the{" "}
              <span className="text-oxblood italic font-normal">credential</span>.
            </p>
            <p className="mt-8 text-[18px] sm:text-[20px] leading-[1.4] text-cream/80 italic font-display text-center">
              Show your work. Earn your ships.
            </p>

            <div className="mt-14 sm:mt-16 max-w-[34rem] mx-auto">
              <WaitlistForm source="landing_closing" id="closing" variant="dark" />
              <p className="mt-5 text-[13px] tracking-[0.02em] text-cream/60 text-center sm:text-left">
                Free for students. Always.
              </p>
            </div>

            <div className="mt-12 sm:mt-14 flex justify-center">
              <Link
                href="#companies"
                className="link-anim text-[14px] tracking-[0.01em] text-cream/80 hover:text-cream transition-colors duration-200 ease-out"
              >
                Talk to us about posting a task{" "}
                <span aria-hidden className="ml-1">→</span>
              </Link>
            </div>

            <div className="mt-20 sm:mt-28 pt-10 border-t border-cream/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <span aria-hidden className="font-rune text-oxblood text-[14px] leading-none">
                  ᛟ
                </span>
                <Wordmark size="md" asLink={false} className="!text-cream" />
              </div>
              <p className="text-[12px] tracking-[0.04em] text-cream/60">
                © 2026 RuneShips
                <span aria-hidden className="mx-2.5 text-cream/30">·</span>
                <a
                  href="mailto:hello@runeships.com"
                  className="link-anim hover:text-cream transition-colors duration-200 ease-out"
                >
                  hello@runeships.com
                </a>
                <span aria-hidden className="mx-2.5 text-cream/30">·</span>
                <Link
                  href="/privacy"
                  className="link-anim hover:text-cream transition-colors duration-200 ease-out"
                >
                  Privacy
                </Link>
                <span aria-hidden className="mx-2.5 text-cream/30">·</span>
                <Link
                  href="/proof"
                  className="link-anim hover:text-cream transition-colors duration-200 ease-out"
                >
                  Methodology
                </Link>
                <span aria-hidden className="mx-2.5 text-cream/30">·</span>
                <Link
                  href="/story"
                  className="link-anim hover:text-cream transition-colors duration-200 ease-out"
                >
                  Story
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
