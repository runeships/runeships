import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { RuneMark } from "@/components/RuneMark";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";
import { ProfileMockup } from "@/components/ProfileMockup";
import { HowItWorks } from "@/components/HowItWorks";
import { TaskCard } from "@/components/TaskCard";
import { AudienceTabs } from "@/components/AudienceTabs";
import { CredibilityList } from "@/components/CredibilityList";

export default function Home() {
  return (
    <main className="px-6 sm:px-10 md:px-16">
      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-headline"
        className="mx-auto max-w-[1240px] pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32"
      >
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
              <p className="text-[18px] sm:text-[20px] leading-[1.45] text-ink/80 max-w-[40ch]">
                RuneShips lets students complete real company tasks, get AI
                feedback in minutes, and build a public skill rank recruiters
                can trust.
              </p>
            </Reveal>

            <Reveal mode="load" delay={0.30} className="mt-5">
              <p className="text-[13px] leading-[1.55] text-muted max-w-[44ch]">
                Free for students. Companies post tasks for free. Recruiters
                pay to find proven early-career talent.
              </p>
            </Reveal>

            <Reveal mode="load" delay={0.42} id="waitlist" className="mt-9 scroll-mt-28">
              <WaitlistForm source="landing_hero" id="hero" />
            </Reveal>

            <Reveal mode="load" delay={0.52} className="mt-6">
              <Link
                href="#companies"
                className="
                  inline-flex items-center gap-1.5
                  text-[14px] tracking-[0.01em] text-ink
                  underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
                  transition-colors duration-200 ease-out
                "
              >
                Post a pilot task <span aria-hidden>→</span>
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
      </section>

      {/* ─── 2. HOW IT WORKS ─────────────────────────────────────── */}
      <Section id="how-it-works" runeChar="ᛞ" runeLabel="Dagaz — breakthrough, daybreak">
        <SectionHeading>How RuneShips works.</SectionHeading>
        <div className="mt-12 sm:mt-16">
          <HowItWorks />
        </div>
      </Section>

      {/* ─── 3. THE EXPERIENCE TRAP ─────────────────────────────── */}
      <Section runeChar="ᚱ" runeLabel="Raidho — journey, breaking the cycle">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <SectionHeading className="max-w-[14ch]">
              Skip the experience trap.
            </SectionHeading>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
            <p>
              The system is closed at the front door. Every entry-level
              internship asks for prior internship experience — preferably at a
              name-brand firm — that almost no freshman or sophomore can have
              yet. The qualification it filters for is the qualification it
              refuses to let you earn.
            </p>
            <p>
              The fix isn&rsquo;t more applications. It&rsquo;s a way to prove
              the work directly, get real feedback, and walk away with a record
              that doesn&rsquo;t depend on anyone vouching for you.{" "}
              <span className="text-ink">The work is the credential.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ─── 4. SAMPLE TASK CARD ────────────────────────────────── */}
      <Section runeChar="ᚲ" runeLabel="Kenaz — knowledge, craft, mastery">
        <SectionHeading>A task on RuneShips.</SectionHeading>
        <div className="mt-12 sm:mt-16 max-w-[1080px]">
          <TaskCard />
        </div>
      </Section>

      {/* ─── 5. AUDIENCE TABS ───────────────────────────────────── */}
      <Section runeChar="ᚷ" runeLabel="Gebo — exchange, two-sided gift">
        {/* Anchors targeted by the sticky nav. AudienceTabs reads the hash
            on mount and selects the matching tab. */}
        <span id="students" aria-hidden className="block scroll-mt-28" />
        <span id="companies" aria-hidden className="block scroll-mt-28" />

        <SectionHeading>Two sides. One system.</SectionHeading>
        <div className="mt-12 sm:mt-16">
          <AudienceTabs />
        </div>
      </Section>

      {/* ─── 6. WHY THE RANK MEANS SOMETHING ────────────────────── */}
      <Section runeChar="ᚦ" runeLabel="Thurisaz — test, scrutiny, gating">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <SectionHeading className="max-w-[14ch]">
              Why the rank is trustworthy.
            </SectionHeading>
          </div>
          <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
            <p>
              A rank is only useful if it&rsquo;s hard to fake and hard to
              flatter. RuneShips treats every submission as evidence to weigh,
              not a participation log. Six things keep it honest:
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <CredibilityList />
        </div>

        <div className="mt-12 sm:mt-14">
          <Link
            href="/proof"
            className="
              inline-flex items-center gap-1.5
              text-[14px] tracking-[0.01em] text-ink
              underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
              transition-colors duration-200 ease-out
            "
          >
            Read our full evaluation methodology <span aria-hidden>→</span>
          </Link>
        </div>
      </Section>

      {/* ─── 7. FOUNDER NOTE (compressed) ──────────────────────── */}
      <Section runeChar="ᛟ" runeLabel="Othala — heritage, origin, first-person">
        <SectionHeading className="max-w-[18ch]">
          A note from the founder.
        </SectionHeading>

        <div className="mt-10 sm:mt-12 grid grid-cols-12 gap-x-6">
          <div className="col-span-12 md:col-span-8 lg:col-span-7 pl-6 sm:pl-8 border-l-2 border-oxblood">
            <p className="font-display text-[20px] sm:text-[22px] leading-[1.45] italic text-ink/90 max-w-[48ch]">
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
                className="
                  inline-flex items-center gap-1.5
                  text-[14px] tracking-[0.01em] text-ink
                  underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
                  transition-colors duration-200 ease-out
                "
              >
                Read the full story <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 8. CLOSING ────────────────────────────────────────── */}
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
                The work is the credential.
              </p>
              <p className="mt-5 text-[18px] sm:text-[20px] leading-[1.4] text-oxblood italic font-display">
                Show your work. Earn your ships.
              </p>

              <div className="mt-12 sm:mt-14 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                <Link
                  href="#waitlist"
                  className="
                    inline-flex items-center
                    min-h-[56px] px-7
                    bg-oxblood text-cream
                    border border-oxblood
                    text-[15px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                  "
                >
                  Get early access
                </Link>
                <Link
                  href="#companies"
                  className="
                    inline-flex items-center gap-1.5
                    text-[14px] tracking-[0.01em] text-ink
                    underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
                    transition-colors duration-200 ease-out
                  "
                >
                  Talk to us <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="mt-16 sm:mt-20">
                <Wordmark size="md" asLink={false} />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="pb-10">
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
            <Link
              href="/privacy"
              className="hover:text-ink transition-colors duration-200 ease-out"
            >
              Privacy
            </Link>
          </p>
          <p className="text-[12px] tracking-[0.04em] text-muted flex gap-4">
            <Link
              href="/proof"
              className="hover:text-ink transition-colors duration-200 ease-out"
            >
              Methodology
            </Link>
            <Link
              href="/story"
              className="hover:text-ink transition-colors duration-200 ease-out"
            >
              Story
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 * Local layout primitives.
 * ────────────────────────────────────────────────────────────────────── */

type SectionProps = {
  id?: string;
  runeChar: string;
  runeLabel: string;
  children: React.ReactNode;
};

/**
 * Editorial section frame: hairline rule on top, a single rune kicker,
 * generous vertical air. No card, no shadow. Content fades in on scroll.
 */
function Section({ id, runeChar, runeLabel, children }: SectionProps) {
  return (
    <section
      id={id}
      className="mx-auto max-w-[1240px] border-t border-rule pt-20 sm:pt-28 pb-24 sm:pb-32 scroll-mt-28"
    >
      <Reveal mode="scroll">
        <div className="mb-12 sm:mb-14">
          <RuneMark rune={runeChar} label={runeLabel} />
        </div>
        {children}
      </Reveal>
    </section>
  );
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display font-light tracking-[-0.018em] leading-[1.04] text-ink ${className}`}
      style={{ fontSize: "var(--text-section)" }}
    >
      {children}
    </h2>
  );
}
