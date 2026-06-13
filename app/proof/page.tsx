import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How we evaluate work — RuneShips",
  description:
    "Our methodology, the five RuneShips dimensions, how AI scoring works, and what we don't yet claim.",
};

const LAST_UPDATED = "June 13, 2026";

export default function ProofPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Methodology
        </p>
        <h1
          className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          How RuneShips evaluates work.
        </h1>

        <Lede>
          <p>
            RuneShips assesses real tasks across five skill dimensions,
            generates AI-driven feedback in minutes, and aggregates
            performance into a portable cross-company ranking. This page
            explains how that actually works, what it can and can&rsquo;t
            measure, and what we do to keep scoring honest.
          </p>
          <p>
            We don&rsquo;t claim to measure intelligence, talent, or
            ultimate professional potential. We measure your work, on
            specific tasks, against a specific rubric, scored by a specific
            AI model. The number is one signal — useful, but not the whole
            picture.
          </p>
        </Lede>

        <Section title="The five dimensions">
          <p>
            Every task is scored across the same five axes. We chose these
            because they show up across most knowledge work — and
            they&rsquo;re independent enough that being strong in one
            doesn&rsquo;t predict strength in another.
          </p>
          <DefinitionList>
            <DefItem term="Strategy">
              Analytical thinking, problem framing, decision logic. How
              clearly do you identify what matters? How well do you reason
              from evidence to conclusion?
            </DefItem>
            <DefItem term="Execution">
              Quality, completeness, attention to detail. Did you actually
              finish the work? Is it well-built? Does it deliver?
            </DefItem>
            <DefItem term="Communication">
              Clarity, structure, presentation. Can someone unfamiliar with
              the work understand it? Is the writing or design clean?
            </DefItem>
            <DefItem term="Technical">
              Appropriate use of tools, code, data, calculations. Did you
              reach for the right instrument? Did you use it well?
            </DefItem>
            <DefItem term="Creativity">
              Original insight, novel framing, differentiated thinking. Did
              you bring something to the work that wasn&rsquo;t obvious
              from the brief?
            </DefItem>
          </DefinitionList>
          <p>
            Different tasks weight these dimensions differently — a code
            project leans heavily on Technical and Execution, a strategic
            memo leans on Strategy and Communication. The task definition
            determines the weights.
          </p>
        </Section>

        <Section title="How scoring works">
          <p>
            Each submission gets evaluated by Anthropic&rsquo;s Claude
            Haiku 4.5. The AI receives:
          </p>
          <ul>
            <li>The task brief (the same one you saw)</li>
            <li>Your submission (text, link, or both)</li>
            <li>
              The five-dimension rubric with calibration anchors (50 =
              average, 70 = strong, 85+ = exceptional)
            </li>
            <li>
              Instructions to provide 200–400 words of specific qualitative
              feedback
            </li>
          </ul>
          <p>
            It returns scores per dimension and qualitative feedback. We
            compute a weighted total using the task&rsquo;s dimension
            weights. The whole thing takes 30–60 seconds.
          </p>
          <p>
            We use Haiku because it&rsquo;s the right balance of cost and
            quality for this use case. As reliability data accumulates, we
            may move to stronger models for specific task types.
          </p>
        </Section>

        <Section title="What we don’t yet claim">
          <p>
            A skeptical reader should know what we haven&rsquo;t proved:
          </p>
          <DefinitionList>
            <DefItem term="AI grading reliability is still being validated.">
              We&rsquo;re early. We&rsquo;re running calibration experiments
              — submitting varied-quality work to the same task and
              checking that scores cluster appropriately. Initial results
              are promising but not yet enough to make strong claims at
              scale.
            </DefItem>
            <DefItem term="Anti-gameability is an open problem.">
              A student could theoretically submit LLM-generated work and
              receive a high score. We&rsquo;re working on detection and
              prevention measures, but for now: if you&rsquo;re submitting
              work to be evaluated, submit your work.
            </DefItem>
            <DefItem term="Rankings are provisional below a certain cohort size.">
              Percentiles need data to be meaningful. Below 25 active
              students per task, your rank is provisional — directionally
              useful, not statistically anchored.
            </DefItem>
            <DefItem term="A score is not a verdict.">
              It&rsquo;s one model&rsquo;s evaluation at one point in time
              on one specific task. People evolve. Models improve. Use the
              feedback to grow; use the score to track your trajectory.
            </DefItem>
          </DefinitionList>
        </Section>

        <Section title="What we’re doing about this">
          <p>Ongoing work to keep scoring honest:</p>
          <ul>
            <li>
              Calibration audits comparing AI scores to human expert
              evaluation on a sample of submissions
            </li>
            <li>
              Multi-model verification — running the same submission
              through Claude, GPT, and Gemini and checking convergence
            </li>
            <li>
              Submission integrity checks including provenance signals,
              time-based patterns, and anomaly detection
            </li>
            <li>
              Public methodology — this page exists. We&rsquo;ll keep it
              updated as we learn.
            </li>
          </ul>
          <p>
            If you spot something that looks off — a score that
            doesn&rsquo;t match the feedback, qualitative text that&rsquo;s
            generic or wrong, suspicious patterns — send feedback. We read
            every report.
          </p>
        </Section>

        <p className="mt-16 text-[12px] tracking-[0.04em] text-muted">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-16 pt-10 border-t border-rule">
          <Link
            href="/"
            className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}

/* ─── Editorial helpers ─────────────────────────────────────────── */

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 prose-editorial text-[18px] sm:text-[19px] leading-[1.65] text-ink/85 space-y-5">
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 sm:mt-16">
      <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.018em] text-ink">
        {title}
      </h2>
      <hr className="mt-3 border-0 border-t border-ink/10" />
      <div className="mt-6 prose-editorial text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 space-y-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-[1.65]">
        {children}
      </div>
    </section>
  );
}

function DefinitionList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

function DefItem({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <strong className="text-oxblood font-semibold">{term}</strong>
      {" — "}
      {children}
    </p>
  );
}
