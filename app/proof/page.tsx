import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { RuneMark } from "@/components/RuneMark";

export const metadata: Metadata = {
  title: "Why the rank means something — RuneShips",
  description:
    "How RuneShips evaluates submissions: task-specific rubrics, AI evaluation, human calibration, anti-gaming measures, and why ranks compound across tasks.",
};

/**
 * Editorial article layout. Centered text column, max-width 680px.
 * Section bodies are marked PLACEHOLDER so they're easy to find and
 * replace with final copy.
 */
export default function ProofPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <Reveal mode="load" delay={0.05}>
          <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
            Evaluation methodology
          </p>
          <h1
            className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "var(--text-display)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Why the rank means something.
          </h1>
        </Reveal>

        <Reveal mode="load" delay={0.20} className="mt-10">
          <Placeholder>
            Intro paragraph. Frame the whole essay: ranks are only useful if
            they&rsquo;re hard to fake and hard to flatter. Briefly preview the
            six sections below.
          </Placeholder>
        </Reveal>

        <ArticleSection
          runeChar="ᚦ"
          runeLabel="Thurisaz — test, scrutiny"
          title="The rubric structure"
        >
          <Placeholder>
            What &ldquo;good&rdquo; looks like is task-specific, not generic.
            Every task ships with its own rubric: the criteria, the weighting,
            and what disqualifies a submission outright. Explain how rubrics
            are built with the task author and reviewed before the task goes
            live.
          </Placeholder>
        </ArticleSection>

        <ArticleSection
          runeChar="ᚲ"
          runeLabel="Kenaz — discernment"
          title="The AI evaluation layer"
        >
          <Placeholder>
            What the AI catches: weak reasoning, missing rubric requirements,
            generic answers, copy-pasted boilerplate, contradictions. What it
            doesn&rsquo;t catch reliably: novel framings, unconventional but
            correct approaches. Be explicit about the limits.
          </Placeholder>
        </ArticleSection>

        <ArticleSection
          runeChar="ᛗ"
          runeLabel="Mannaz — human review"
          title="Human calibration"
        >
          <Placeholder>
            Top submissions in each task (and a random sample of borderline
            ones) get reviewed by a human evaluator before points are
            finalized. Why this matters for trust. Why it&rsquo;s sustainable
            at scale.
          </Placeholder>
        </ArticleSection>

        <ArticleSection
          runeChar="ᛇ"
          runeLabel="Eihwaz — defense"
          title="Anti-gaming measures"
        >
          <Placeholder>
            Submission diversity checks. Plagiarism detection. AI-detection on
            submissions themselves (and why we&rsquo;re honest that
            AI-assisted work is allowed but copy-paste is not). What we do
            when someone is caught.
          </Placeholder>
        </ArticleSection>

        <ArticleSection
          runeChar="ᛏ"
          runeLabel="Tiwaz — judgment"
          title="Participation alone earns zero"
        >
          <Placeholder>
            Show-up points cheapen everything else. Explain why submitting a
            bad-faith or incomplete task earns nothing — not a small amount,
            zero — and why this is the only way the top of the rank stays
            meaningful.
          </Placeholder>
        </ArticleSection>

        <ArticleSection
          runeChar="ᛒ"
          runeLabel="Berkano — compounding"
          title="Why rankings compound"
        >
          <Placeholder>
            One lucky submission isn&rsquo;t a rank. Consistency across tasks
            is what makes the rank predict real-world performance. Explain how
            the points-to-percentile math weights repeated strong submissions
            and decays single outliers.
          </Placeholder>
        </ArticleSection>

        <div className="mt-20 sm:mt-24 pt-10 border-t border-rule">
          <Link
            href="/"
            className="
              inline-flex items-center gap-1.5
              text-[14px] tracking-[0.01em] text-ink
              underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
              transition-colors duration-200 ease-out
            "
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}

function ArticleSection({
  runeChar,
  runeLabel,
  title,
  children,
}: {
  runeChar: string;
  runeLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16 sm:mt-20">
      <Reveal mode="scroll">
        <RuneMark rune={runeChar} label={runeLabel} className="!text-[18px]" />
        <h2
          className="mt-5 font-display font-normal tracking-[-0.016em] leading-[1.1] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.2vw + 1rem, 2rem)" }}
        >
          {title}
        </h2>
        <div className="prose-editorial mt-5 text-[17px] leading-[1.65] text-ink/85">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Placeholder paragraph — muted italic with a leading label so unfinished
 * copy is obvious in-page. Replace `<Placeholder>...</Placeholder>` with
 * `<p>...</p>` when the real copy is ready.
 */
function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[16px] leading-[1.65] text-muted italic">
      <span className="not-italic text-[11px] tracking-[0.16em] uppercase text-oxblood mr-2">
        Placeholder
      </span>
      {children}
    </p>
  );
}
