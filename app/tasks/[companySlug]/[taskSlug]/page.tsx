import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { SubmissionForm } from "@/components/SubmissionForm";
import {
  COOLDOWN_MS,
  formatNextAllowed,
  submissionModeLabel,
  testedDimensions,
  timeAgo,
} from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { companySlug: string; taskSlug: string };

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { companySlug, taskSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/tasks/${companySlug}/${taskSlug}`)}`,
    );
  }

  // Look the company up first, then fetch the task within it. Two short
  // queries are simpler than nesting slug filters through a join, and
  // they yield cleaner 404 behavior.
  const { data: company } = await supabase
    .from("companies")
    .select("id, slug, name, is_practice")
    .eq("slug", companySlug)
    .maybeSingle();
  if (!company) notFound();

  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, slug, title, brief, submission_mode, estimated_time, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity, is_published",
    )
    .eq("company_id", company.id)
    .eq("slug", taskSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (!task) notFound();

  // Past submissions for this task (most recent first). Used for both
  // the iteration-history list and the cooldown calculation.
  const { data: pastSubmissions } = await supabase
    .from("submissions")
    .select("id, submission_title, created_at")
    .eq("user_id", user.id)
    .eq("task_id", task.id)
    .order("created_at", { ascending: false });

  const latestSubmission = pastSubmissions?.[0];
  const cooldownUntil = latestSubmission
    ? new Date(new Date(latestSubmission.created_at).getTime() + COOLDOWN_MS)
    : null;
  const inCooldown =
    cooldownUntil !== null && cooldownUntil.getTime() > Date.now();

  const companyKicker = company.is_practice
    ? "Practice task"
    : company.name;
  const tested = testedDimensions(task);

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
          <span className="text-muted">{company.name}</span>
          <span aria-hidden className="mx-2 text-muted/50">
            /
          </span>
          <span className="text-ink/70">{task.title}</span>
        </nav>

        {/* Hero */}
        <header className="mt-10 sm:mt-12">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            {companyKicker}
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.6vw + 1rem, 3.25rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {task.title}
          </h1>
          <p className="mt-5 text-[14px] leading-[1.55] text-muted">
            {submissionModeLabel(task.submission_mode)}
            {task.estimated_time && (
              <>
                <span aria-hidden className="mx-2 text-muted/50">
                  ·
                </span>
                {task.estimated_time}
              </>
            )}
            {tested.length > 0 && (
              <>
                <span aria-hidden className="mx-2 text-muted/50">
                  ·
                </span>
                Tests: {tested.join(" · ")}
              </>
            )}
          </p>
        </header>

        {/* Brief */}
        <section className="mt-16 sm:mt-20">
          <SectionHeading>The brief</SectionHeading>
          <div className="mt-8 sm:mt-10 mx-auto max-w-[680px] text-[17px] leading-[1.7] text-ink/85 whitespace-pre-line">
            {task.brief.trim()}
          </div>
        </section>

        {/* Past submissions (only if any) */}
        {pastSubmissions && pastSubmissions.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <SectionHeading>Your previous attempts</SectionHeading>
            <ul className="mt-8 divide-y divide-ink/10 max-w-[680px]">
              {pastSubmissions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/submissions/${s.id}`}
                    className="
                      group flex items-baseline justify-between gap-4
                      py-5
                      transition-colors duration-200 ease-out
                      hover:bg-parchment/60 -mx-3 px-3
                    "
                  >
                    <div className="min-w-0">
                      <h3 className="font-display font-normal text-[18px] sm:text-[19px] leading-[1.25] tracking-[-0.01em] text-ink">
                        {s.submission_title}
                      </h3>
                      <p className="mt-1.5 text-[13px] text-muted">
                        Submitted {timeAgo(s.created_at)}
                      </p>
                    </div>
                    <span
                      aria-hidden
                      className="text-oxblood text-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1 shrink-0"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Submission form / cooldown notice */}
        <section className="mt-20 sm:mt-24">
          <SectionHeading>Submit your work</SectionHeading>

          <div className="mt-8 sm:mt-10">
            {inCooldown && cooldownUntil ? (
              <div className="pl-6 sm:pl-8 border-l-2 border-oxblood max-w-[60ch]">
                <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                  Cooldown active
                </p>
                <p className="mt-4 text-[17px] leading-[1.6] text-ink/85">
                  You can submit again at{" "}
                  <span className="text-ink font-medium">
                    {formatNextAllowed(cooldownUntil.toISOString())}
                  </span>
                  . The 24-hour cooldown is there to encourage real iteration,
                  not rapid re-attempts.
                </p>
              </div>
            ) : (
              <SubmissionForm
                taskId={task.id}
                submissionMode={task.submission_mode}
              />
            )}
          </div>
        </section>
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
