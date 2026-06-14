import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyUser } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import { domainOf, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const DIMENSIONS = [
  { label: "Strategy", scoreKey: "score_strategy", weightKey: "weight_strategy" },
  { label: "Execution", scoreKey: "score_execution", weightKey: "weight_execution" },
  { label: "Communication", scoreKey: "score_communication", weightKey: "weight_communication" },
  { label: "Technical", scoreKey: "score_technical", weightKey: "weight_technical" },
  { label: "Creativity", scoreKey: "score_creativity", weightKey: "weight_creativity" },
] as const;

export default async function CompanySubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyUser();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("submissions")
    .select(
      "id, user_id, task_id, submission_title, submission_body, supporting_link, link_access_confirmed, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!submission) notFound();

  const { data: task } = await admin
    .from("tasks")
    .select(
      "id, title, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
    )
    .eq("id", submission.task_id)
    .maybeSingle();
  if (!task || task.company_id !== company.id) notFound();

  const [profileRes, feedbackRes] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name, email, school, graduation_year")
      .eq("id", submission.user_id)
      .maybeSingle(),
    admin
      .from("feedback")
      .select(
        "score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score, qualitative_feedback, model_used, generated_at",
      )
      .eq("submission_id", submission.id)
      .maybeSingle(),
  ]);
  const student = profileRes.data;
  const feedback = feedbackRes.data;

  const studentName = student?.full_name ?? "(unnamed student)";
  const studentMeta = [
    student?.school,
    student?.graduation_year ? `Class of ${student.graduation_year}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const radarValues: RadarValues | null = feedback
    ? {
        strategy: feedback.score_strategy,
        execution: feedback.score_execution,
        communication: feedback.score_communication,
        technical: feedback.score_technical,
        creativity: feedback.score_creativity,
      }
    : null;

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href={`/companies/tasks/${task.id}`}
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to {task.title}
          </Link>
        </nav>

        <header className="mt-7">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Submission
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.2vw + 1rem, 2.75rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {studentName}
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            {studentMeta}
            {studentMeta && (
              <span aria-hidden className="mx-2 text-muted/50">·</span>
            )}
            Submitted {timeAgo(submission.created_at)}
          </p>
        </header>

        <section className="mt-12 mx-auto max-w-[760px]">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
            Their submission
          </p>
          <h2 className="font-display font-normal text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.012em] text-ink">
            {submission.submission_title}
          </h2>

          {submission.submission_body && (
            <EditorialMarkdown
              content={submission.submission_body}
              className="mt-6"
            />
          )}

          {submission.supporting_link && (
            <div className="mt-7 border-l-2 border-oxblood/60 pl-6">
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
                Supporting link
              </p>
              <a
                href={submission.supporting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 min-h-[44px] px-5 bg-oxblood text-cream border border-oxblood text-[14px] tracking-[0.01em] font-medium hover:bg-oxblood-hover transition-colors duration-200 ease-out"
              >
                Open submission ↗
              </a>
              <p className="mt-2 text-[12px] text-muted">
                {domainOf(submission.supporting_link)}
              </p>
            </div>
          )}
        </section>

        {feedback && radarValues && (
          <section className="mt-16 sm:mt-20">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
              Scores
            </p>
            <div className="border border-ink/15 bg-cream p-7 sm:p-10 rounded-[2px]">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14 items-start">
                <div className="flex justify-center lg:justify-start">
                  <RadarChart values={radarValues} size={340} showScoreLabels />
                </div>
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
                    {DIMENSIONS.map((d) => (
                      <li
                        key={d.label}
                        className="grid grid-cols-[1fr_auto] gap-4 items-baseline py-3"
                      >
                        <div>
                          <p className="text-[14px] tracking-[-0.005em] text-ink">
                            {d.label}
                          </p>
                          <p className="text-[11px] tracking-[0.04em] text-muted mt-0.5">
                            {Math.round(task[d.weightKey] * 100)}% weight
                          </p>
                        </div>
                        <p
                          className="font-display text-[18px] leading-[1] text-ink tabular-nums"
                          style={{ fontVariationSettings: '"opsz" 96' }}
                        >
                          {feedback[d.scoreKey]}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 mx-auto max-w-[760px]">
              <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                Written feedback
              </p>
              <EditorialMarkdown
                content={feedback.qualitative_feedback}
                className="mt-4"
              />
              <p className="mt-8 text-[12px] tracking-[0.04em] text-muted">
                Generated by{" "}
                {feedback.model_used === "human-reviewer"
                  ? "human reviewer"
                  : "our AI grader"}{" "}
                ·{" "}
                {new Date(feedback.generated_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </section>
        )}

        {!feedback && (
          <div className="mt-12 mx-auto max-w-[680px]">
            <div className="pl-6 sm:pl-8 border-l-2 border-oxblood">
              <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                Awaiting feedback
              </p>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink/85">
                Feedback for this submission hasn&rsquo;t generated yet.
                Refresh in a few minutes.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
