import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "How we evaluate work · RuneShips",
  description:
    "Our methodology, the five RuneShips dimensions, how AI scoring works, and what we don't yet claim.",
};

const LAST_UPDATED = "June 13, 2026";

const PROOF_BODY = `
RuneShips assesses real tasks across five skill dimensions, generates AI-driven feedback in minutes, and aggregates performance into a portable cross-company ranking. This page explains how that actually works, what it can and can't measure, and what we do to keep scoring honest.

We don't claim to measure intelligence, talent, or ultimate professional potential. We measure your work, on specific tasks, against a specific rubric, scored by a specific AI model. The number is one signal: useful, but not the whole picture.

## The five dimensions

Every task is scored across the same five axes. We chose these because they show up across most knowledge work, and they're independent enough that being strong in one doesn't predict strength in another.

**Strategy.** Analytical thinking, problem framing, decision logic. How clearly do you identify what matters? How well do you reason from evidence to conclusion?

**Execution.** Quality, completeness, attention to detail. Did you actually finish the work? Is it well-built? Does it deliver?

**Communication.** Clarity, structure, presentation. Can someone unfamiliar with the work understand it? Is the writing or design clean?

**Technical.** Appropriate use of tools, code, data, calculations. Did you reach for the right instrument? Did you use it well?

**Creativity.** Original insight, novel framing, differentiated thinking. Did you bring something to the work that wasn't obvious from the brief?

Different tasks weight these dimensions differently: a code project leans heavily on Technical and Execution, a strategic memo leans on Strategy and Communication. The task definition determines the weights.

## How scoring works

Each submission gets evaluated by Anthropic's Claude Haiku 4.5. The AI receives:

- The task brief (the same one you saw)
- Your submission (text, link, or both)
- The five-dimension rubric with calibration anchors (50 = average, 70 = strong, 85+ = exceptional)
- Instructions to provide 200–400 words of specific qualitative feedback

It returns scores per dimension and qualitative feedback. We compute a weighted total using the task's dimension weights. The whole thing takes 30–60 seconds.

We use Haiku because it's the right balance of cost and quality for this use case. As reliability data accumulates, we may move to stronger models for specific task types.

## What we don't yet claim

A skeptical reader should know what we haven't proved:

**AI grading reliability is still being validated.** We're early. We're running calibration experiments by submitting varied-quality work to the same task and checking that scores cluster appropriately. Initial results are promising but not yet enough to make strong claims at scale.

**Anti-gameability is an open problem.** A student could theoretically submit LLM-generated work and receive a high score. We're working on detection and prevention measures, but for now: if you're submitting work to be evaluated, submit your work.

**Rankings are provisional below a certain cohort size.** Percentiles need data to be meaningful. Below 25 active students per task, your rank is provisional: directionally useful, not statistically anchored.

**A score is not a verdict.** It's one model's evaluation at one point in time on one specific task. People evolve. Models improve. Use the feedback to grow; use the score to track your trajectory.

## What we're doing about this

Ongoing work to keep scoring honest:

- Calibration audits comparing AI scores to human expert evaluation on a sample of submissions
- Multi-model verification by running the same submission through Claude, GPT, and Gemini and checking convergence
- Submission integrity checks including provenance signals, time-based patterns, and anomaly detection
- Public methodology; this page exists. We'll keep it updated as we learn.

If you spot something that looks off (a score that doesn't match the feedback, qualitative text that's generic or wrong, suspicious patterns), send feedback. We read every report.
`.trim();

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

        <EditorialMarkdown content={PROOF_BODY} className="mt-10" />

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
