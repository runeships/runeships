import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { NotifyCohortButton } from "@/components/NotifyCohortButton";
import { timeAgo, domainOf } from "@/lib/format";
import { ArrowUpRight, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Review queue — submissions whose task is human-evaluated and that
 * have no feedback row yet. Oldest first. Each row links to
 * /admin/review/[id] for the scoring form.
 */
export default async function AdminIndexPage() {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const admin = createAdminClient();

  const [submissionsRes, humanTasksRes, feedbackRes] = await Promise.all([
    admin
      .from("submissions")
      .select(
        "id, user_id, task_id, submission_title, supporting_link, created_at",
      )
      .order("created_at", { ascending: true }),
    admin
      .from("tasks")
      .select("id, title, company_id, category")
      .eq("evaluation_mode", "human"),
    admin.from("feedback").select("submission_id"),
  ]);

  if (submissionsRes.error || humanTasksRes.error || feedbackRes.error) {
    console.error("[admin queue]", {
      submissions: submissionsRes.error,
      tasks: humanTasksRes.error,
      feedback: feedbackRes.error,
    });
    return <QueueError email={adminEmail} />;
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

  const userIds = unique(pending.map((p) => p.user_id));
  const taskIds = unique(pending.map((p) => p.task_id));

  const [profilesRes, taskDetailRes] = await Promise.all([
    userIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, email, school, graduation_year")
          .in("id", userIds)
      : Promise.resolve({
          data: [] as {
            id: string;
            full_name: string | null;
            email: string;
            school: string | null;
            graduation_year: number | null;
          }[],
          error: null,
        }),
    taskIds.length > 0
      ? admin
          .from("tasks")
          .select("id, title, company_id")
          .in("id", taskIds)
      : Promise.resolve({
          data: [] as { id: string; title: string; company_id: string }[],
          error: null,
        }),
  ]);
  const companyIds = unique(
    (taskDetailRes.data ?? []).map((t) => t.company_id),
  );
  const companiesRes =
    companyIds.length > 0
      ? await admin
          .from("companies")
          .select("id, name")
          .in("id", companyIds)
      : { data: [] as { id: string; name: string }[], error: null };

  const profileById = byId(profilesRes.data ?? [], (p) => p.id);
  const taskById = byId(taskDetailRes.data ?? [], (t) => t.id);
  const companyById = byId(companiesRes.data ?? [], (c) => c.id);

  // ─── Tasks section data ─────────────────────────────────────
  // Every published task + its company + its lifetime submission
  // count, so the admin can fire a "new task" email blast directly
  // from the queue page.
  const allTasksRes = await admin
    .from("tasks")
    .select(
      "id, slug, title, company_id, category, evaluation_mode, is_published",
    )
    .eq("is_published", true)
    .order("category", { ascending: true });
  const allCompanyIds = unique(
    (allTasksRes.data ?? []).map((t) => t.company_id),
  );
  const allCompaniesRes =
    allCompanyIds.length > 0
      ? await admin
          .from("companies")
          .select("id, name")
          .in("id", allCompanyIds)
      : { data: [] as { id: string; name: string }[], error: null };
  const allCompanyById = byId(allCompaniesRes.data ?? [], (c) => c.id);
  // Submission counts via JS histogram across all submissions.
  const taskSubmissionCounts = new Map<string, number>();
  for (const s of submissionsRes.data ?? []) {
    taskSubmissionCounts.set(
      s.task_id,
      (taskSubmissionCounts.get(s.task_id) ?? 0) + 1,
    );
  }

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <AdminNav current="queue" email={adminEmail} />

        <h1
          className="mt-10 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
          style={{
            fontSize: "clamp(1.85rem, 2.4vw + 1rem, 2.5rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Submissions awaiting your review
        </h1>

        {pending.length === 0 ? (
          <EmptyQueue />
        ) : (
          <>
            <p className="mt-5 font-display italic text-[16px] sm:text-[17px] leading-[1.5] text-muted max-w-[56ch]">
              {pending.length === 1
                ? "1 submission waiting. Oldest first."
                : `${pending.length} submissions waiting. Oldest first.`}
            </p>

            <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              {pending.map((s) => {
                const studentProfile = profileById.get(s.user_id);
                const task = taskById.get(s.task_id);
                const company = task
                  ? companyById.get(task.company_id)
                  : null;
                const studentName =
                  studentProfile?.full_name ??
                  studentProfile?.email ??
                  "(unknown student)";
                const studentMeta = [
                  studentProfile?.school,
                  studentProfile?.graduation_year
                    ? `Class of ${studentProfile.graduation_year}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li
                    key={s.id}
                    className="py-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-6 gap-y-4 items-start"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-[0.06em] uppercase text-muted">
                        <span className="text-oxblood">
                          {timeAgo(s.created_at)}
                        </span>
                        <span aria-hidden className="mx-2 text-muted/50">·</span>
                        {new Date(s.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <h2 className="mt-2 font-display font-normal text-[18px] sm:text-[20px] leading-[1.25] tracking-[-0.012em] text-ink truncate">
                        {s.submission_title}
                      </h2>
                      <p className="mt-2 text-[13px] text-muted truncate">
                        <span className="text-ink">{studentName}</span>
                        {studentMeta && (
                          <>
                            <span aria-hidden className="mx-2 text-muted/50">·</span>
                            {studentMeta}
                          </>
                        )}
                      </p>
                      <p className="mt-2 text-[13px] text-muted truncate">
                        {task?.title ?? "(task missing)"}
                        {company && (
                          <>
                            <span aria-hidden className="mx-2 text-muted/50">·</span>
                            {company.name}
                          </>
                        )}
                      </p>
                      {s.supporting_link && (
                        <a
                          href={s.supporting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            mt-3 inline-flex items-center gap-1.5
                            text-[12px] tracking-[0.005em] text-muted
                            link-anim hover:text-ink
                            transition-colors duration-200 ease-out
                          "
                        >
                          {domainOf(s.supporting_link)}
                          <ArrowUpRight
                            aria-hidden
                            size={12}
                            strokeWidth={1.8}
                          />
                        </a>
                      )}
                    </div>
                    <div className="shrink-0 sm:pt-1">
                      <Link
                        href={`/admin/review/${s.id}`}
                        className="
                          inline-flex items-center
                          min-h-[44px] px-5
                          bg-oxblood text-cream border border-oxblood
                          text-[13px] tracking-[0.01em] font-medium
                          transition-colors duration-200 ease-out
                          hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
                          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                        "
                      >
                        Review →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* ─── Tasks ─────────────────────────────────────────── */}
        <section className="mt-20 sm:mt-24">
          <div>
            <h2
              className="font-display font-light tracking-[-0.018em] leading-[1.1] text-ink"
              style={{ fontSize: "clamp(1.5rem, 1vw + 1rem, 1.75rem)" }}
            >
              Tasks
            </h2>
            <hr className="mt-4 border-0 border-t border-ink/10" />
          </div>
          <p className="mt-5 font-display italic text-[15px] leading-[1.5] text-muted max-w-[56ch]">
            All published tasks. Use “Notify cohort” to email opted-in
            students whose interests match the task’s primary dimensions.
          </p>
          <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {(allTasksRes.data ?? []).map((t) => {
              const tc = allCompanyById.get(t.company_id);
              const subCount = taskSubmissionCounts.get(t.id) ?? 0;
              return (
                <li
                  key={t.id}
                  className="py-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-x-6 gap-y-3 items-center"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] tracking-[-0.005em] text-ink font-medium">
                      {t.title}
                    </p>
                    <p className="mt-1 text-[12px] text-muted">
                      {tc?.name ?? "(unknown company)"}
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      <span className="uppercase tracking-[0.04em]">
                        {t.evaluation_mode === "human"
                          ? "human review"
                          : "ai feedback"}
                      </span>
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      {subCount}{" "}
                      {subCount === 1 ? "submission" : "submissions"}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <NotifyCohortButton
                      taskId={t.id}
                      taskTitle={t.title}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

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

function EmptyQueue() {
  return (
    <div className="mt-14 border border-ink/15 bg-cream p-10 sm:p-12 text-center">
      <Inbox
        aria-hidden
        size={32}
        strokeWidth={1.4}
        className="mx-auto text-oxblood/50"
      />
      <p
        className="mt-5 font-display font-light leading-[1.15] text-ink"
        style={{ fontSize: "clamp(1.4rem, 1.2vw + 1rem, 1.7rem)" }}
      >
        The queue is clear.
      </p>
      <p className="mt-3 text-[14px] leading-[1.55] text-muted max-w-[44ch] mx-auto">
        No submissions waiting for review. The queue will populate as
        students submit work on human-evaluated tasks.
      </p>
    </div>
  );
}

function QueueError({ email }: { email: string }) {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 pb-24 min-h-dvh">
      <div className="mx-auto max-w-[680px]">
        <AdminNav current="queue" email={email} />
        <p className="mt-10 text-[11px] tracking-[0.18em] uppercase text-oxblood">
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
