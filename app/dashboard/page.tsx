import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { RadarValues } from "@/components/RadarChart";
import { TaskGrid, type TaskForGrid } from "@/components/TaskGrid";
import { RankingPanel } from "@/components/RankingPanel";
import { getRankings } from "@/lib/rankings";
import { timeAgo } from "@/lib/format";
import type {
  SubmissionMode,
  TaskCategory,
} from "@/lib/database.types";

export const dynamic = "force-dynamic";

/**
 * Shape returned by the dashboard's joined task query. Supabase JS may
 * return the `company` relation as either an object (single) or as an
 * array of one (depending on how it resolves the FK). The helper
 * `normalizeRelation` folds both shapes into a single `Company | null`.
 */
type TaskRowRaw = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  submission_mode: SubmissionMode;
  estimated_time: string | null;
  order_index: number;
  category: TaskCategory;
  weight_strategy: number;
  weight_execution: number;
  weight_communication: number;
  weight_technical: number;
  weight_creativity: number;
  company: CompanyMin | CompanyMin[] | null;
};

type CompanyMin = {
  slug: string;
  name: string;
  is_practice: boolean;
};

type SubmissionRowRaw = {
  id: string;
  submission_title: string;
  created_at: string;
  task:
    | {
        title: string;
        company: { name: string } | { name: string }[] | null;
      }
    | { title: string; company: { name: string } | { name: string }[] | null }[]
    | null;
  feedback:
    | { total_score: number }
    | { total_score: number }[]
    | null;
};

type SubmissionRowData = {
  id: string;
  submission_title: string;
  created_at: string;
  task: { title: string; company: { name: string } | null } | null;
  totalScore: number | null;
};

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

/**
 * Post-onboarding student hub: available tasks, the user's submissions,
 * and a small radar of their self-rated starting profile. Every data
 * fetch is wrapped in try/catch so a transient Supabase error renders
 * a visible diagnostic panel instead of a blank page.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // ─── Profile ──────────────────────────────────────────────────────
  let profile: {
    full_name: string | null;
    school: string | null;
    graduation_year: number | null;
    onboarding_completed: boolean;
    self_rated_strategy: number;
    self_rated_execution: number;
    self_rated_communication: number;
    self_rated_technical: number;
    self_rated_creativity: number;
    career_tracks: string[];
  } | null = null;
  let profileError: string | null = null;

  try {
    const result = await supabase
      .from("profiles")
      .select(
        "full_name, school, graduation_year, career_tracks, onboarding_completed, self_rated_strategy, self_rated_execution, self_rated_communication, self_rated_technical, self_rated_creativity",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (result.error) {
      profileError = result.error.message;
      console.error("[dashboard profile]", result.error);
    } else {
      profile = result.data;
    }
  } catch (err) {
    profileError = err instanceof Error ? err.message : "Unknown error";
    console.error("[dashboard profile throw]", err);
  }

  // If the profile row genuinely doesn't exist OR the lookup errored,
  // surface it inline — don't silent-redirect into a loop.
  if (!profile && !profileError) {
    redirect("/onboarding");
  }
  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // ─── Tasks ────────────────────────────────────────────────────────
  let tasks: TaskForGrid[] = [];
  let tasksError: string | null = null;

  try {
    const result = await supabase
      .from("tasks")
      .select(
        `
          id, slug, title, brief, submission_mode, estimated_time, order_index, category,
          weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity,
          company:companies (slug, name, is_practice)
        `,
      )
      .eq("is_published", true);

    if (result.error) {
      tasksError = result.error.message;
      console.error("[dashboard tasks]", result.error);
    } else {
      const raw = (result.data ?? []) as unknown as TaskRowRaw[];
      const normalized = raw.map(
        (t): TaskForGrid & { order_index: number } => ({
          id: t.id,
          slug: t.slug,
          title: t.title,
          brief: t.brief,
          submission_mode: t.submission_mode,
          estimated_time: t.estimated_time,
          category: t.category,
          weight_strategy: t.weight_strategy,
          weight_execution: t.weight_execution,
          weight_communication: t.weight_communication,
          weight_technical: t.weight_technical,
          weight_creativity: t.weight_creativity,
          company: normalizeRelation(t.company),
          order_index: t.order_index,
        }),
      );
      // Sort once on the server (practice first, then alphabetical
      // by company, then by order_index inside a company). TaskGrid
      // preserves this order while filtering.
      normalized.sort((a, b) => {
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
      tasks = normalized.map((t) => {
        const { order_index: _orderIndex, ...rest } = t;
        void _orderIndex;
        return rest;
      });
    }
  } catch (err) {
    tasksError = err instanceof Error ? err.message : "Unknown error";
    console.error("[dashboard tasks throw]", err);
  }

  // ─── Submissions ──────────────────────────────────────────────────
  let submissions: SubmissionRowData[] = [];
  let submissionsError: string | null = null;

  try {
    const result = await supabase
      .from("submissions")
      .select(
        `
          id, submission_title, created_at,
          task:tasks (
            title,
            company:companies (name)
          ),
          feedback (total_score)
        `,
      )
      .order("created_at", { ascending: false });

    if (result.error) {
      submissionsError = result.error.message;
      console.error("[dashboard submissions]", result.error);
    } else {
      const raw = (result.data ?? []) as unknown as SubmissionRowRaw[];
      submissions = raw.map((s) => {
        const task = normalizeRelation(s.task);
        const fb = normalizeRelation(s.feedback);
        return {
          id: s.id,
          submission_title: s.submission_title,
          created_at: s.created_at,
          task: task
            ? { title: task.title, company: normalizeRelation(task.company) }
            : null,
          totalScore: fb ? fb.total_score : null,
        };
      });
    }
  } catch (err) {
    submissionsError = err instanceof Error ? err.message : "Unknown error";
    console.error("[dashboard submissions throw]", err);
  }

  // ─── Cohort rankings (cached per request) ────────────────────────
  // Source of truth for the "Where you stand" hero. The pentagon radar
  // now lives inside that panel — the previously separate "Your skill
  // profile" section was removed so the two visualisations (absolute
  // shape + relative rank) sit together as one truth.
  const rankings = await getRankings(user.id);

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] ?? "there";

  const radarValues: RadarValues | null = profile
    ? {
        strategy: profile.self_rated_strategy,
        execution: profile.self_rated_execution,
        communication: profile.self_rated_communication,
        technical: profile.self_rated_technical,
        creativity: profile.self_rated_creativity,
      }
    : null;

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

        {/* If any of the data fetches errored, show a compact diagnostic
            panel inline so we never produce a fully blank page. */}
        {(profileError || tasksError || submissionsError) && (
          <div className="mt-10 pl-6 sm:pl-8 border-l-2 border-oxblood max-w-[64ch] space-y-2">
            <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
              Something went wrong loading your dashboard
            </p>
            {profileError && (
              <p className="text-[13px] text-ink/80">
                Profile: <span className="text-ink">{profileError}</span>
              </p>
            )}
            {tasksError && (
              <p className="text-[13px] text-ink/80">
                Tasks: <span className="text-ink">{tasksError}</span>
              </p>
            )}
            {submissionsError && (
              <p className="text-[13px] text-ink/80">
                Submissions:{" "}
                <span className="text-ink">{submissionsError}</span>
              </p>
            )}
            <p className="text-[12px] text-muted pt-1">
              Refresh the page or sign out and back in. If it keeps happening,
              the error message above will be in the Vercel function logs.
            </p>
          </div>
        )}

        {/* ─── Section 1: Available tasks ─────────────────────────── */}
        <section className="mt-16 sm:mt-20">
          <DashboardSectionHeading>Available tasks</DashboardSectionHeading>

          {tasks.length === 0 ? (
            <p className="mt-8 text-[15px] leading-[1.55] text-muted">
              {tasksError
                ? "Couldn’t load tasks — see the message above."
                : "No tasks published yet."}
            </p>
          ) : (
            <div className="mt-8">
              <TaskGrid tasks={tasks} />
            </div>
          )}
        </section>

        {/* ─── Section 2: Your submissions ────────────────────────── */}
        <section className="mt-20 sm:mt-24">
          <DashboardSectionHeading>Your submissions</DashboardSectionHeading>

          {submissions.length === 0 ? (
            <p className="mt-8 text-[15px] leading-[1.55] text-muted max-w-[44ch]">
              {submissionsError
                ? "Couldn’t load submissions — see the message above."
                : "No submissions yet. Pick a brief above to start."}
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

        {/* ─── Section 3: Where you stand ─────────────────────────── */}
        {radarValues && (
          <section className="mt-20 sm:mt-24">
            <DashboardSectionHeading>Where you stand</DashboardSectionHeading>
            <div className="mt-8">
              <RankingPanel rankings={rankings} selfRated={radarValues} />
            </div>
          </section>
        )}
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
        {submission.totalScore !== null ? (
          <div>
            <p className="text-[10px] tracking-[0.18em] uppercase text-oxblood">
              Score
            </p>
            <p
              className="mt-0.5 font-display font-light text-[24px] sm:text-[26px] leading-[1] text-oxblood tabular-nums tracking-[-0.018em]"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {Math.round(submission.totalScore)}
            </p>
          </div>
        ) : (
          <span className="inline-flex items-center text-[11px] tracking-[0.06em] uppercase text-muted">
            Retry feedback
          </span>
        )}
        <p className="mt-1.5 text-[12px] tracking-[0.005em] text-muted">
          Submitted {timeAgo(submission.created_at)}
        </p>
      </div>
    </Link>
  );
}
