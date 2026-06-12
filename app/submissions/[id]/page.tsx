import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { domainOf, timeAgo } from "@/lib/format";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import { RetryFeedbackButton } from "@/components/RetryFeedbackButton";
import {
  RegradeButton,
  RegradeRequestedPanel,
} from "@/components/RegradeButton";
import { SubmissionContext } from "@/components/SubmissionContext";
import { LongshipSVG } from "@/components/Longship";
import { hypotheticalPercentile, type Dimension } from "@/lib/rankings";

export const dynamic = "force-dynamic";

// `RetryFeedbackButton` calls generateFeedback from this route — same
// 60s timeout reason as /tasks/[companySlug]/[taskSlug].
export const maxDuration = 60;

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/submissions/${id}`);

  // Submissions RLS limits the SELECT to the user's own rows, so a
  // missing/forbidden row both look the same here. Render a clean
  // "not found" page instead of a 5xx.
  const { data: submission } = await supabase
    .from("submissions")
    .select(
      "id, submission_title, submission_body, supporting_link, link_access_confirmed, created_at, task_id",
    )
    .eq("id", id)
    .maybeSingle();

  if (!submission) {
    return <SubmissionNotFound />;
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("id, slug, title, company_id")
    .eq("id", submission.task_id)
    .maybeSingle();

  const { data: company } = task
    ? await supabase
        .from("companies")
        .select("slug, name")
        .eq("id", task.company_id)
        .maybeSingle()
    : { data: null };

  const { data: feedback } = await supabase
    .from("feedback")
    .select(
      "score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score, qualitative_feedback, model_used, generated_at",
    )
    .eq("submission_id", submission.id)
    .maybeSingle();

  // Weights are needed for the per-dimension breakdown panel.
  const { data: taskWeights } = task
    ? await supabase
        .from("tasks")
        .select(
          "weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
        )
        .eq("id", task.id)
        .maybeSingle()
    : { data: null };

  // Existing regrade request (if any) — drives the human-review CTA.
  // Only meaningful when feedback exists, but cheap enough to fetch
  // unconditionally and keep the JSX path simple.
  const { data: regrade } = await supabase
    .from("regrade_requests")
    .select("created_at, status")
    .eq("submission_id", submission.id)
    .maybeSingle();

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/dashboard"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            Dashboard
          </Link>
          <span aria-hidden className="mx-2 text-muted/50">
            /
          </span>
          <span className="text-ink/70">{submission.submission_title}</span>
        </nav>

        {/* Hero */}
        <header className="mt-10 sm:mt-12">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            {company?.name ?? "Submission"} · Submission
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.6vw + 1rem, 3.25rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {submission.submission_title}
          </h1>
          <p className="mt-5 text-[14px] leading-[1.55] text-muted">
            {task ? (
              <>
                Submitted to{" "}
                {company && task ? (
                  <Link
                    href={`/tasks/${company.slug}/${task.slug}`}
                    className="link-anim text-muted hover:text-ink transition-colors duration-200 ease-out"
                  >
                    {task.title}
                  </Link>
                ) : (
                  <span>{task.title}</span>
                )}
                <span aria-hidden className="mx-2 text-muted/50">
                  ·
                </span>
              </>
            ) : null}
            {timeAgo(submission.created_at)}
          </p>
        </header>

        {/* Your submission */}
        <section className="mt-16 sm:mt-20">
          <SectionHeading>Your submission</SectionHeading>

          {submission.submission_body && (
            <div className="mt-8 sm:mt-10 mx-auto max-w-[680px] text-[17px] leading-[1.7] text-ink/85 whitespace-pre-line">
              {submission.submission_body}
            </div>
          )}

          {submission.supporting_link && (
            <div
              className={`
                mt-${submission.submission_body ? "10 sm:mt-12" : "8 sm:mt-10"}
                mx-auto max-w-[680px]
                border-l-2 border-oxblood/60 pl-6
              `}
            >
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
                Supporting link
              </p>
              <p className="mt-2 text-[16px] leading-[1.55] break-words">
                <a
                  href={submission.supporting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    link-anim text-ink hover:text-oxblood
                    transition-colors duration-200 ease-out
                  "
                >
                  {domainOf(submission.supporting_link)}
                </a>
              </p>
              {submission.link_access_confirmed && (
                <p className="mt-2 text-[12px] tracking-[0.005em] text-muted">
                  Confirmed publicly viewable when submitted
                </p>
              )}
            </div>
          )}
        </section>

        {/* AI feedback */}
        <section className="mt-20 sm:mt-24">
          <SectionHeading>AI feedback</SectionHeading>

          {feedback ? (
            <FeedbackContent
              feedback={feedback}
              weights={taskWeights}
              submissionId={submission.id}
              regrade={regrade}
              userId={user.id}
              taskId={submission.task_id}
            />
          ) : (
            <div className="mt-8 sm:mt-10 mx-auto max-w-[680px]">
              <div className="pl-6 sm:pl-8 border-l-2 border-oxblood">
                <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                  Feedback not yet available
                </p>
                <p className="mt-4 text-[17px] leading-[1.6] text-ink/90">
                  Feedback generation didn&rsquo;t complete for this
                  submission. This sometimes happens during API hiccups —
                  your submission is still saved, and you can retry
                  generation now.
                </p>
                <div className="mt-7">
                  <RetryFeedbackButton submissionId={submission.id} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer back-link */}
        <div className="mt-20 sm:mt-24 pt-8 border-t border-ink/10">
          <Link
            href="/dashboard"
            className="
              link-anim text-[14px] tracking-[0.005em] text-ink
              hover:text-oxblood transition-colors duration-200 ease-out
            "
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2
        className="font-display font-light tracking-[-0.018em] leading-[1.1] text-ink"
        style={{ fontSize: "clamp(1.5rem, 1vw + 1rem, 1.75rem)" }}
      >
        {children}
      </h2>
      <hr className="mt-4 border-0 border-t border-ink/10" />
    </div>
  );
}

type FeedbackRow = {
  score_strategy: number;
  score_execution: number;
  score_communication: number;
  score_technical: number;
  score_creativity: number;
  total_score: number;
  qualitative_feedback: string;
  model_used: string;
  generated_at: string;
};

type TaskWeights = {
  weight_strategy: number;
  weight_execution: number;
  weight_communication: number;
  weight_technical: number;
  weight_creativity: number;
};

const DIMENSION_ROWS: Array<{
  name: string;
  dim: Dimension;
  scoreKey: keyof Pick<
    FeedbackRow,
    | "score_strategy"
    | "score_execution"
    | "score_communication"
    | "score_technical"
    | "score_creativity"
  >;
  weightKey: keyof TaskWeights;
}> = [
  { name: "Strategy", dim: "strategy", scoreKey: "score_strategy", weightKey: "weight_strategy" },
  { name: "Execution", dim: "execution", scoreKey: "score_execution", weightKey: "weight_execution" },
  { name: "Communication", dim: "communication", scoreKey: "score_communication", weightKey: "weight_communication" },
  { name: "Technical", dim: "technical", scoreKey: "score_technical", weightKey: "weight_technical" },
  { name: "Creativity", dim: "creativity", scoreKey: "score_creativity", weightKey: "weight_creativity" },
];

async function FeedbackContent({
  feedback,
  weights,
  submissionId,
  regrade,
  userId,
  taskId,
}: {
  feedback: FeedbackRow;
  weights: TaskWeights | null;
  submissionId: string;
  regrade: {
    created_at: string;
    status: "pending" | "resolved" | "declined";
  } | null;
  userId: string;
  taskId: string;
}) {
  const radarValues: RadarValues = {
    strategy: feedback.score_strategy,
    execution: feedback.score_execution,
    communication: feedback.score_communication,
    technical: feedback.score_technical,
    creativity: feedback.score_creativity,
  };

  // Strongest dimension on THIS submission specifically — the score
  // breakdown gets a small inline ship beside that row. Hypothetical
  // percentile reads "if this score were your aggregate, where would
  // you rank?"
  const strongestHere = DIMENSION_ROWS.reduce((best, row) =>
    feedback[row.scoreKey] > feedback[best.scoreKey] ? row : best,
  );
  const hypoPercentile = await hypotheticalPercentile(
    userId,
    strongestHere.dim,
    feedback[strongestHere.scoreKey],
  );

  const generatedDate = new Date(feedback.generated_at);
  const generatedFormatted = generatedDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="mt-8 sm:mt-10">
      {/* Score summary panel: radar + breakdown */}
      <div className="border border-ink/15 bg-cream p-7 sm:p-10 rounded-[2px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14 items-start">
          {/* Radar */}
          <div className="flex justify-center lg:justify-start">
            <RadarChart
              values={radarValues}
              size={340}
              showScoreLabels
            />
          </div>

          {/* Total + per-dimension breakdown */}
          <div>
            <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
              Total score
            </p>
            <p
              className="mt-2 font-display font-light leading-[0.95] text-ink tracking-[-0.025em]"
              style={{
                fontSize: "clamp(3.5rem, 5vw + 1rem, 4.5rem)",
                fontVariationSettings: '"opsz" 144',
              }}
            >
              {Math.round(feedback.total_score)}
            </p>
            <p className="mt-2 text-[12px] tracking-[0.04em] text-muted">
              Weighted across 5 dimensions
            </p>

            <ul className="mt-7 divide-y divide-ink/10">
              {DIMENSION_ROWS.map((d) => {
                const score = feedback[d.scoreKey];
                const weight = weights ? weights[d.weightKey] : null;
                const isStrongestHere = d.dim === strongestHere.dim;
                return (
                  <li
                    key={d.name}
                    className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3"
                  >
                    <div>
                      <p className="text-[14px] tracking-[-0.005em] text-ink">
                        {d.name}
                      </p>
                      {weight !== null && (
                        <p className="text-[11px] tracking-[0.04em] text-muted mt-0.5">
                          {Math.round(weight * 100)}% weight
                        </p>
                      )}
                    </div>
                    {/* Subtle visual heartbeat — the strongest dim
                        here gets a small longship filled to its
                        hypothetical percentile. */}
                    {isStrongestHere ? (
                      <LongshipSVG
                        percentile={hypoPercentile}
                        dimension={d.dim}
                        width={56}
                        height={34}
                      />
                    ) : (
                      <span aria-hidden />
                    )}
                    <p
                      className="font-display text-[18px] leading-[1] text-ink tabular-nums"
                      style={{ fontVariationSettings: '"opsz" 96' }}
                    >
                      {score}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* In-context framing — only renders when user has ≥3 total
          submissions. Sits between the score panel and the regrade
          CTA so the relative-shape narrative happens before the
          dispute path. */}
      <SubmissionContext
        userId={userId}
        submissionId={submissionId}
        taskId={taskId}
        feedback={{
          score_strategy: feedback.score_strategy,
          score_execution: feedback.score_execution,
          score_communication: feedback.score_communication,
          score_technical: feedback.score_technical,
          score_creativity: feedback.score_creativity,
        }}
      />

      {/* Human regrade CTA / status — sits between the scores and the
          written feedback so a student who disagrees with the grade
          sees the escape hatch before reading the prose. */}
      <div className="mt-12 sm:mt-14 mx-auto max-w-[680px]">
        {regrade ? (
          <RegradeRequestedPanel
            requestedAt={regrade.created_at}
            status={regrade.status}
          />
        ) : (
          <RegradeButton submissionId={submissionId} />
        )}
      </div>

      {/* Qualitative feedback */}
      <div className="mt-14 sm:mt-16 mx-auto max-w-[680px]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          Written feedback
        </p>
        <div className="mt-5 text-[17px] leading-[1.7] text-ink/85 whitespace-pre-line">
          {feedback.qualitative_feedback}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-12 sm:mt-14 text-[12px] tracking-[0.04em] text-muted mx-auto max-w-[680px]">
        Generated by our AI grader
        <span aria-hidden className="mx-2 text-muted/50">
          ·
        </span>
        {generatedFormatted}
      </p>
    </div>
  );
}

function SubmissionNotFound() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-32 sm:pt-40 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[560px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-muted">
          Not found
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2rem, 3.6vw + 1rem, 3rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Submission not found.
        </h1>
        <p className="mt-6 text-[17px] leading-[1.55] text-muted max-w-[44ch]">
          We couldn&rsquo;t find that submission — it may have been deleted, or
          it belongs to someone else.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="
              link-anim text-[14px] tracking-[0.005em] text-ink
              hover:text-oxblood transition-colors duration-200 ease-out
            "
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
