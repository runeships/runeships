import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { timeAgo, domainOf } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Review queue. Lists every submission whose task is flagged
 * evaluation_mode='human' and which doesn't yet have a feedback row.
 * Oldest first (FIFO). Each row links into /admin/review/[id].
 */
export default async function AdminIndexPage() {
  await requireAdmin();
  const admin = createAdminClient();

  // 1. All submissions, oldest first.
  // 2. Filter to ones whose task is human-evaluated AND have no
  //    feedback row.
  // Done as three parallel queries + JS join — postgrest joins
  // through hand-typed relationships are flaky in this codebase
  // (see notes in /admin/regrades).
  const [submissionsRes, humanTasksRes, feedbackRes] = await Promise.all([
    admin
      .from("submissions")
      .select("id, user_id, task_id, submission_title, supporting_link, created_at")
      .order("created_at", { ascending: true }),
    admin
      .from("tasks")
      .select("id, title, company_id")
      .eq("evaluation_mode", "human"),
    admin.from("feedback").select("submission_id"),
  ]);

  if (submissionsRes.error || humanTasksRes.error || feedbackRes.error) {
    console.error("[admin queue]", {
      submissions: submissionsRes.error,
      tasks: humanTasksRes.error,
      feedback: feedbackRes.error,
    });
    return <QueueError />;
  }

  const humanTaskIds = new Set(
    (humanTasksRes.data ?? []).map((t) => t.id),
  );
  const feedbackSubmissionIds = new Set(
    (feedbackRes.data ?? []).map((f) => f.submission_id),
  );

  const pending = (submissionsRes.data ?? []).filter(
    (s) =>
      humanTaskIds.has(s.task_id) && !feedbackSubmissionIds.has(s.id),
  );

  // Bulk-fetch related data for the rows we'll display.
  const userIds = unique(pending.map((p) => p.user_id));
  const taskIds = unique(pending.map((p) => p.task_id));
  const [profilesRes, taskDetailRes] = await Promise.all([
    userIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string }[], error: null }),
    taskIds.length > 0
      ? admin
          .from("tasks")
          .select("id, title, company_id")
          .in("id", taskIds)
      : Promise.resolve({ data: [] as { id: string; title: string; company_id: string }[], error: null }),
  ]);
  const companyIds = unique(
    (taskDetailRes.data ?? []).map((t) => t.company_id),
  );
  const companiesRes = companyIds.length > 0
    ? await admin.from("companies").select("id, name").in("id", companyIds)
    : { data: [] as { id: string; name: string }[], error: null };

  const profileById = byId(profilesRes.data ?? [], (p) => p.id);
  const taskById = byId(taskDetailRes.data ?? [], (t) => t.id);
  const companyById = byId(companiesRes.data ?? [], (c) => c.id);

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Admin
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2rem, 3.6vw + 1rem, 3.25rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Review queue
        </h1>
        <p className="mt-5 font-display italic text-[17px] sm:text-[19px] leading-[1.5] text-muted max-w-[56ch]">
          Submissions awaiting human evaluation.
        </p>

        <nav
          aria-label="Admin sections"
          className="mt-8 text-[13px] tracking-[0.005em] text-muted flex flex-wrap gap-x-6 gap-y-2"
        >
          <Link
            href="/admin/regrades"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            Regrade requests →
          </Link>
        </nav>

        {pending.length === 0 ? (
          <div className="mt-14 pl-6 sm:pl-8 border-l-2 border-ink/15 max-w-[60ch]">
            <p className="text-[16px] leading-[1.7] text-muted">
              No submissions waiting for review. The queue will populate as
              students submit work on human-evaluated tasks.
            </p>
          </div>
        ) : (
          <>
            <ul className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
              {pending.map((s) => {
                const profile = profileById.get(s.user_id);
                const task = taskById.get(s.task_id);
                const company = task
                  ? companyById.get(task.company_id)
                  : null;
                return (
                  <li
                    key={s.id}
                    className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto_auto] gap-x-6 gap-y-2 items-baseline py-5"
                  >
                    <div>
                      <p className="text-[13px] tracking-[0.005em] text-muted">
                        {timeAgo(s.created_at)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted/70">
                        {new Date(s.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                        {profile?.full_name ?? profile?.email ?? "(unknown)"}
                      </p>
                      <p className="mt-0.5 text-[13px] text-muted truncate">
                        {task?.title ?? "(task missing)"}
                        {company && (
                          <>
                            <span aria-hidden className="mx-2 text-muted/50">·</span>
                            {company.name}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {s.supporting_link ? (
                        <a
                          href={s.supporting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-anim text-[13px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
                        >
                          {domainOf(s.supporting_link)} ↗
                        </a>
                      ) : (
                        <span className="text-[12px] text-muted">No link</span>
                      )}
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/admin/review/${s.id}`}
                        className="
                          inline-flex items-center
                          min-h-[40px] px-5
                          bg-oxblood text-cream border border-oxblood
                          text-[13px] tracking-[0.01em] font-medium
                          transition-colors duration-200 ease-out
                          hover:bg-oxblood-hover
                        "
                      >
                        Review →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-[12px] leading-[1.55] text-muted">
              {pending.length}{" "}
              {pending.length === 1 ? "submission" : "submissions"} awaiting
              review.
            </p>
          </>
        )}

        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link
            href="/dashboard"
            className="link-anim text-[14px] tracking-[0.005em] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

function QueueError() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 pb-24 min-h-dvh">
      <div className="mx-auto max-w-[680px]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          Something went wrong
        </p>
        <p className="mt-4 text-[17px] leading-[1.6] text-muted">
          Couldn&rsquo;t load the review queue. Check the server logs and
          retry.
        </p>
      </div>
    </main>
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function byId<T, K extends string>(
  arr: T[],
  keyFn: (item: T) => K,
): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of arr) map.set(keyFn(item), item);
  return map;
}
