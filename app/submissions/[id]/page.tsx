import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { domainOf, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

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

  // Feedback is the Prompt 4 wiring — for now this is always null and we
  // render the "generating" placeholder.
  const { data: feedback } = await supabase
    .from("feedback")
    .select(
      "score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score, qualitative_feedback, model_used, generated_at",
    )
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
            // Placeholder structure — the actual score+feedback rendering
            // lands in Prompt 4 once the feedback generator is wired.
            <div className="mt-8 sm:mt-10 mx-auto max-w-[680px]">
              <p className="text-[16px] leading-[1.7] text-ink/85 whitespace-pre-line">
                {feedback.qualitative_feedback}
              </p>
              <p className="mt-6 text-[12px] tracking-[0.04em] text-muted">
                Total score: {Math.round(feedback.total_score * 100) / 100}
                <span aria-hidden className="mx-2 text-muted/50">
                  ·
                </span>
                Generated by {feedback.model_used}
              </p>
            </div>
          ) : (
            <div className="mt-8 sm:mt-10 mx-auto max-w-[680px]">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="inline-block w-2 h-2 rounded-full bg-oxblood live-dot mt-2.5 shrink-0"
                />
                <div>
                  <p className="text-[17px] leading-[1.6] text-ink/90">
                    Feedback is being generated.
                  </p>
                  <p className="mt-2 text-[15px] leading-[1.6] text-ink/70">
                    This typically takes 30–60 seconds. Refresh this page in a
                    moment.
                  </p>
                  <p className="mt-5 text-[13px] leading-[1.55] text-muted max-w-[58ch]">
                    Once feedback arrives, you&rsquo;ll see scores across the
                    five dimensions and detailed written feedback here.
                  </p>
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
