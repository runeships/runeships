import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import {
  submissionModeLabel,
  testedDimensions,
  timeAgo,
} from "@/lib/format";
import type { SubmissionMode } from "@/lib/database.types";

export const dynamic = "force-dynamic";

// Shape returned by the dashboard's joined task query. Supabase JS infers
// the relationship as a single object given the FK, but TS gen output
// types it as a possibly-null relation — cast for clarity.
type TaskRowData = {
  id: string;
  slug: string;
  title: string;
  submission_mode: SubmissionMode;
  estimated_time: string | null;
  order_index: number;
  weight_strategy: number;
  weight_execution: number;
  weight_communication: number;
  weight_technical: number;
  weight_creativity: number;
  company: {
    slug: string;
    name: string;
    is_practice: boolean;
  } | null;
};

type SubmissionRowData = {
  id: string;
  submission_title: string;
  created_at: string;
  task: {
    title: string;
    company: { name: string } | null;
  } | null;
};

/**
 * Post-onboarding student hub: available tasks, the user's submissions,
 * and a small radar of their self-rated starting profile.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, school, graduation_year, career_tracks, specific_skills, onboarding_completed, self_rated_strategy, self_rated_execution, self_rated_communication, self_rated_technical, self_rated_creativity",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login?error=invalid_link");
  if (!profile.onboarding_completed) redirect("/onboarding");

  // Available tasks
  const { data: tasksRaw } = await supabase
    .from("tasks")
    .select(
      `
        id, slug, title, submission_mode, estimated_time, order_index,
        weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity,
        company:companies (slug, name, is_practice)
      `,
    )
    .eq("is_published", true);

  const tasks = ((tasksRaw ?? []) as unknown as TaskRowData[]).slice();
  // Sort: practice first (by order_index), then companies alphabetically
  // (within a company by order_index).
  tasks.sort((a, b) => {
    const aPractice = a.company?.is_practice ?? false;
    const bPractice = b.company?.is_practice ?? false;
    if (aPractice && !bPractice) return -1;
    if (!aPractice && bPractice) return 1;
    if (!aPractice && !bPractice) {
      const aName = a.company?.name ?? "";
      const bName = b.company?.name ?? "";
      const diff = aName.localeCompare(bName);
      if (diff !== 0) return diff;
    }
    return a.order_index - b.order_index;
  });

  // User's submissions
  const { data: submissionsRaw } = await supabase
    .from("submissions")
    .select(
      `
        id, submission_title, created_at,
        task:tasks (
          title,
          company:companies (name)
        )
      `,
    )
    .order("created_at", { ascending: false });

  const submissions = (submissionsRaw ?? []) as unknown as SubmissionRowData[];

  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] ?? "there";

  const radarValues: RadarValues = {
    strategy: profile.self_rated_strategy,
    execution: profile.self_rated_execution,
    communication: profile.self_rated_communication,
    technical: profile.self_rated_technical,
    creativity: profile.self_rated_creativity,
  };

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <header>
          <p className="text-[11px] tracking-[0.20em] uppercase text-muted">
            Dashboard
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4.4vw + 1rem, 3.75rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Welcome, {firstName}.
          </h1>
          <p className="mt-5 text-[17px] leading-[1.55] text-muted max-w-[50ch]">
            Pick a brief. Submit your thinking. Earn your scores.
          </p>
        </header>

        {/* ─── Section 1: Available tasks ─────────────────────────── */}
        <section className="mt-16 sm:mt-20">
          <DashboardSectionHeading>Available tasks</DashboardSectionHeading>

          {tasks.length === 0 ? (
            <p className="mt-8 text-[15px] leading-[1.55] text-muted">
              No tasks published yet.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-ink/10">
              {tasks.map((t) => (
                <li key={t.id}>
                  <TaskRow task={t} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Section 2: Your submissions ────────────────────────── */}
        <section className="mt-20 sm:mt-24">
          <DashboardSectionHeading>Your submissions</DashboardSectionHeading>

          {submissions.length === 0 ? (
            <p className="mt-8 text-[15px] leading-[1.55] text-muted max-w-[44ch]">
              No submissions yet. Pick a brief above to start.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-ink/10">
              {submissions.map((s) => (
                <li key={s.id}>
                  <SubmissionRow submission={s} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ─── Section 3: Your starting profile ───────────────────── */}
        <section className="mt-20 sm:mt-24">
          <div>
            <h2
              className="font-display font-light tracking-[-0.018em] leading-[1.1] text-ink"
              style={{ fontSize: "clamp(1.4rem, 0.6vw + 1rem, 1.5rem)" }}
            >
              Your starting profile
            </h2>
            <hr className="mt-4 border-0 border-t border-ink/10" />
          </div>

          <div className="mt-10 flex flex-col items-center sm:items-start">
            <div className="border border-ink/15 bg-cream p-6 sm:p-7">
              <RadarChart values={radarValues} size={300} />
            </div>
            <p className="mt-5 text-[13px] leading-[1.6] text-muted max-w-[52ch] text-center sm:text-left">
              These are your initial self-ratings. Real scores from completed
              tasks will build alongside them.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardSectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink"
        style={{ fontSize: "clamp(1.75rem, 1.4vw + 1rem, 2rem)" }}
      >
        {children}
      </h2>
      <hr className="mt-5 border-0 border-t border-ink/10" />
    </div>
  );
}

function TaskRow({ task }: { task: TaskRowData }) {
  const tested = testedDimensions(task);
  const companyName = task.company?.is_practice
    ? "Practice"
    : (task.company?.name ?? "");
  const companySlug = task.company?.slug ?? "";

  return (
    <Link
      href={`/tasks/${companySlug}/${task.slug}`}
      className="
        group grid grid-cols-[88px_1fr_auto] sm:grid-cols-[120px_1fr_auto]
        gap-3 sm:gap-6 items-center
        py-5 sm:py-6 px-3
        transition-colors duration-200 ease-out
        hover:bg-parchment
      "
    >
      <span className="text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-muted self-start sm:self-center">
        {companyName}
      </span>

      <div className="min-w-0">
        <h3 className="font-display font-normal text-[18px] sm:text-[22px] leading-[1.2] tracking-[-0.01em] text-ink">
          {task.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-muted">
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
              {tested.join(" · ")}
            </>
          )}
        </p>
      </div>

      <span
        aria-hidden
        className="text-oxblood text-[18px] sm:text-[20px] transition-transform duration-200 ease-out group-hover:translate-x-1"
      >
        →
      </span>
    </Link>
  );
}

function SubmissionRow({
  submission,
}: {
  submission: SubmissionRowData;
}) {
  return (
    <Link
      href={`/submissions/${submission.id}`}
      className="
        group grid grid-cols-[1fr_auto] gap-5 items-start
        py-5 sm:py-6 px-3
        transition-colors duration-200 ease-out
        hover:bg-parchment
      "
    >
      <div className="min-w-0">
        <h3 className="font-display font-normal text-[16px] sm:text-[18px] leading-[1.25] tracking-[-0.01em] text-ink">
          {submission.submission_title}
        </h3>
        {submission.task && (
          <p className="mt-1.5 text-[13px] leading-[1.5] text-muted">
            for {submission.task.title}
            {submission.task.company?.name && (
              <>
                <span aria-hidden className="mx-2 text-muted/50">
                  ·
                </span>
                {submission.task.company.name}
              </>
            )}
          </p>
        )}
      </div>

      <div className="text-right shrink-0">
        <span className="inline-flex items-center px-2.5 py-1 border border-ink/20 text-[11px] tracking-[0.06em] uppercase text-muted">
          Feedback pending
        </span>
        <p className="mt-1.5 text-[12px] tracking-[0.005em] text-muted">
          Submitted {timeAgo(submission.created_at)}
        </p>
      </div>
    </Link>
  );
}
