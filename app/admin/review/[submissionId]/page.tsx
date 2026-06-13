import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { ReviewForm } from "@/components/ReviewForm";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import { domainOf } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  await requireAdmin();
  const { submissionId } = await params;
  const admin = createAdminClient();

  const { data: submission } = await admin
    .from("submissions")
    .select(
      "id, user_id, task_id, submission_title, submission_body, supporting_link, link_access_confirmed, created_at",
    )
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) notFound();

  const [taskRes, profileRes, existingRes] = await Promise.all([
    admin
      .from("tasks")
      .select(
        "id, title, brief, evaluation_mode, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
      )
      .eq("id", submission.task_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("id, full_name, email, school, graduation_year")
      .eq("id", submission.user_id)
      .maybeSingle(),
    admin
      .from("feedback")
      .select("id")
      .eq("submission_id", submissionId)
      .maybeSingle(),
  ]);

  const task = taskRes.data;
  if (!task) notFound();
  if (task.evaluation_mode !== "human") {
    // Not a human-evaluated task — admin shouldn't be reviewing it
    // here. Bounce back to the queue.
    return (
      <main className="px-6 sm:px-10 pt-28 pb-20">
        <div className="mx-auto max-w-[640px]">
          <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
            Not a human-review task
          </p>
          <p className="mt-4 text-[16px] leading-[1.6] text-muted">
            This task is AI-evaluated. Use the generateFeedback retry flow
            on the submission page instead.
          </p>
          <Link
            href="/admin"
            className="mt-7 inline-flex link-anim text-[14px] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
          >
            ← Back to queue
          </Link>
        </div>
      </main>
    );
  }

  const company = await admin
    .from("companies")
    .select("name")
    .eq("id", task.company_id)
    .maybeSingle();
  const studentName =
    profileRes.data?.full_name ??
    profileRes.data?.email ??
    "(unknown student)";
  const studentMeta = [
    profileRes.data?.school,
    profileRes.data?.graduation_year
      ? `Class of ${profileRes.data.graduation_year}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1240px]">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/admin"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Review queue
          </Link>
        </nav>

        <p className="mt-7 text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Reviewing
        </p>
        <h1
          className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
          style={{
            fontSize: "clamp(1.85rem, 2vw + 1rem, 2.3rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {studentName}&rsquo;s submission
        </h1>
        <p className="mt-4 text-[12px] tracking-[0.06em] uppercase text-muted">
          {task.title}
          {company.data?.name && (
            <>
              <span aria-hidden className="mx-2 text-muted/50">·</span>
              {company.data.name}
            </>
          )}
        </p>
        {studentMeta && (
          <p className="mt-2 text-[13px] text-muted">{studentMeta}</p>
        )}

        {existingRes.data && (
          <div className="mt-7 pl-6 border-l-2 border-oxblood max-w-[60ch]">
            <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
              Already scored
            </p>
            <p className="mt-2 text-[14px] text-ink/85">
              Feedback already exists for this submission. To adjust scores,
              go through the regrade flow.
            </p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT — submission + task context */}
          <div>
            <section>
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
                Submission
              </p>
              <h2 className="mt-3 font-display font-normal text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.012em] text-ink">
                {submission.submission_title}
              </h2>

              {submission.submission_body && (
                <EditorialMarkdown
                  content={submission.submission_body}
                  className="mt-5"
                />
              )}

              {submission.supporting_link && (
                <a
                  href={submission.supporting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-6 inline-flex items-center gap-2
                    min-h-[44px] px-5
                    bg-oxblood text-cream border border-oxblood
                    text-[14px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover
                  "
                >
                  Open submission ↗
                </a>
              )}
              {submission.supporting_link && (
                <p className="mt-2 text-[12px] text-muted break-all">
                  {domainOf(submission.supporting_link)}
                </p>
              )}
            </section>

            <hr className="mt-10 border-0 border-t border-ink/10" />

            <details className="mt-8 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors duration-200 ease-out">
                <span>Task brief</span>
                <span
                  aria-hidden
                  className="text-oxblood text-[14px] group-open:rotate-90 transition-transform duration-200 ease-out"
                >
                  ›
                </span>
              </summary>
              <EditorialMarkdown
                content={task.brief.trim()}
                className="mt-5"
              />
            </details>

            <details className="mt-6 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors duration-200 ease-out">
                <span>Rubric weights</span>
                <span
                  aria-hidden
                  className="text-oxblood text-[14px] group-open:rotate-90 transition-transform duration-200 ease-out"
                >
                  ›
                </span>
              </summary>
              <ul className="mt-5 space-y-2 text-[13px]">
                {[
                  { label: "Strategy", w: task.weight_strategy },
                  { label: "Execution", w: task.weight_execution },
                  { label: "Communication", w: task.weight_communication },
                  { label: "Technical", w: task.weight_technical },
                  { label: "Creativity", w: task.weight_creativity },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between border-b border-ink/5 pb-1.5"
                  >
                    <span className="text-ink">{row.label}</span>
                    <span className="text-oxblood tabular-nums">
                      {Math.round(row.w * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* RIGHT — scoring form */}
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
              Your evaluation
            </p>
            <div className="mt-5">
              <ReviewForm
                submissionId={submission.id}
                weights={{
                  strategy: task.weight_strategy,
                  execution: task.weight_execution,
                  communication: task.weight_communication,
                  technical: task.weight_technical,
                  creativity: task.weight_creativity,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
