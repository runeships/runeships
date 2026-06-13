import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { RegradeAdminRow } from "@/components/RegradeAdminRow";

export const dynamic = "force-dynamic";

/**
 * Admin triage page for regrade requests.
 *
 * Pending requests at the top with inline edit forms. Below that a
 * compact list of recently resolved/declined requests for audit.
 *
 * Reads use the service-role admin client (createAdminClient) because
 * the admin needs to see every student's data, not just their own —
 * the regrade_requests SELECT policy is scoped to the requester.
 */
export default async function AdminRegradesPage() {
  const { user, profile } = await requireAdmin();
  // profile may be null when admin is granted purely via ADMIN_EMAILS
  // (env-only admins don't necessarily have a profiles row). Fall
  // back to the auth user's email.
  const adminEmail = profile?.email ?? user.email ?? "(admin)";

  const admin = createAdminClient();

  // Pull regrade_requests in two passes (pending, then recent
  // resolved/declined) and bulk-fetch the related submissions,
  // tasks, profiles, feedback separately. Avoids PostgREST nested
  // resource expansion since our hand-written Database types declare
  // empty Relationships: [].
  const { data: pendingRequests } = await admin
    .from("regrade_requests")
    .select("id, submission_id, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const { data: resolvedRequests } = await admin
    .from("regrade_requests")
    .select("id, submission_id, resolved_at, status, admin_note")
    .in("status", ["resolved", "declined"])
    .order("resolved_at", { ascending: false })
    .limit(20);

  const pendingRows = await hydratePending(pendingRequests ?? []);
  const resolvedRows = await hydrateResolved(resolvedRequests ?? []);

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Admin · Signed in as {adminEmail}
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2rem, 3.6vw + 1rem, 3.25rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Regrade requests
        </h1>
        <p className="mt-5 text-[15px] leading-[1.55] text-muted max-w-[60ch]">
          {pendingRows.length === 0
            ? "No pending requests."
            : `${pendingRows.length} pending ${
                pendingRows.length === 1 ? "request" : "requests"
              }, oldest first.`}
        </p>

        {/* Pending */}
        {pendingRows.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div>
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.1] text-ink"
                style={{ fontSize: "clamp(1.5rem, 1vw + 1rem, 1.75rem)" }}
              >
                Pending
              </h2>
              <hr className="mt-4 border-0 border-t border-ink/10" />
            </div>

            <div className="mt-8 space-y-5">
              {pendingRows.map((row) => (
                <RegradeAdminRow key={row.regradeId} row={row} />
              ))}
            </div>
          </section>
        )}

        {/* Recently resolved / declined */}
        {resolvedRows.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <div>
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.1] text-ink"
                style={{ fontSize: "clamp(1.5rem, 1vw + 1rem, 1.75rem)" }}
              >
                Recent
              </h2>
              <hr className="mt-4 border-0 border-t border-ink/10" />
            </div>

            <ul className="mt-8 divide-y divide-ink/10">
              {resolvedRows.map((r) => (
                <li
                  key={r.regradeId}
                  className="py-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-x-6 gap-y-2 items-baseline"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] tracking-[-0.005em] text-ink">
                      <Link
                        href={`/submissions/${r.submissionId}`}
                        className="link-anim hover:text-oxblood transition-colors duration-200 ease-out"
                      >
                        {r.submissionTitle}
                      </Link>
                    </p>
                    <p className="text-[12px] text-muted mt-0.5">
                      {r.studentEmail} · {r.taskTitle}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] tracking-[0.16em] uppercase ${
                      r.status === "resolved"
                        ? "text-oxblood"
                        : "text-muted"
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="text-[12px] text-muted tabular-nums">
                    {r.resolvedAt
                      ? new Date(r.resolvedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pendingRows.length === 0 && resolvedRows.length === 0 && (
          <div className="mt-16 border-l-2 border-ink/15 pl-6 max-w-[60ch]">
            <p className="text-[15px] leading-[1.6] text-muted">
              When students request a human regrade, requests land here.
              You&rsquo;ll also get an email at the address configured in{" "}
              <code className="text-[13px]">requestRegrade.ts</code>.
            </p>
          </div>
        )}

        {/* Footer back-link */}
        <div className="mt-20 sm:mt-24 pt-8 border-t border-ink/10">
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

/* ─── Data hydration helpers ──────────────────────────────────────── */

type PendingRequest = {
  id: string;
  submission_id: string;
  created_at: string;
};

type ResolvedRequest = {
  id: string;
  submission_id: string;
  resolved_at: string | null;
  status: "pending" | "resolved" | "declined";
  admin_note: string | null;
};

const NULL_UUID = "00000000-0000-0000-0000-000000000000";

async function hydratePending(rows: PendingRequest[]) {
  if (rows.length === 0) return [];
  const admin = createAdminClient();

  const submissionIds = rows.map((r) => r.submission_id);
  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, submission_title, submission_body, supporting_link, user_id, task_id",
    )
    .in("id", submissionIds);

  const userIds = unique((submissions ?? []).map((s) => s.user_id));
  const taskIds = unique((submissions ?? []).map((s) => s.task_id));

  const [{ data: profiles }, { data: tasks }, { data: feedbacks }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds.length > 0 ? userIds : [NULL_UUID]),
      admin
        .from("tasks")
        .select("id, title, company_id")
        .in("id", taskIds.length > 0 ? taskIds : [NULL_UUID]),
      admin
        .from("feedback")
        .select(
          "submission_id, score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score, qualitative_feedback",
        )
        .in("submission_id", submissionIds),
    ]);

  const companyIds = unique((tasks ?? []).map((t) => t.company_id));
  const { data: companies } = await admin
    .from("companies")
    .select("id, name")
    .in("id", companyIds.length > 0 ? companyIds : [NULL_UUID]);

  const submissionsById = byId(submissions ?? [], (s) => s.id);
  const profilesById = byId(profiles ?? [], (p) => p.id);
  const tasksById = byId(tasks ?? [], (t) => t.id);
  const companiesById = byId(companies ?? [], (c) => c.id);
  const feedbackBySubmission = byId(
    feedbacks ?? [],
    (f) => f.submission_id,
  );

  return rows
    .map((r) => {
      const submission = submissionsById.get(r.submission_id);
      if (!submission) return null;
      const profile = profilesById.get(submission.user_id);
      const task = tasksById.get(submission.task_id);
      const company = task ? companiesById.get(task.company_id) : null;
      const feedback = feedbackBySubmission.get(r.submission_id);

      // No feedback = orphaned regrade row. Skip rather than crash.
      if (!feedback) return null;

      return {
        regradeId: r.id,
        submissionId: r.submission_id,
        studentEmail: profile?.email ?? "(unknown)",
        studentName: profile?.full_name ?? null,
        taskTitle: task?.title ?? "(unknown task)",
        companyName: company?.name ?? "",
        submissionTitle: submission.submission_title,
        submissionBody: submission.submission_body,
        supportingLink: submission.supporting_link,
        requestedAt: r.created_at,
        feedback: {
          score_strategy: feedback.score_strategy,
          score_execution: feedback.score_execution,
          score_communication: feedback.score_communication,
          score_technical: feedback.score_technical,
          score_creativity: feedback.score_creativity,
          total_score: feedback.total_score,
          qualitative_feedback: feedback.qualitative_feedback,
        },
      };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);
}

async function hydrateResolved(rows: ResolvedRequest[]) {
  if (rows.length === 0) return [];
  const admin = createAdminClient();

  const submissionIds = rows.map((r) => r.submission_id);
  const { data: submissions } = await admin
    .from("submissions")
    .select("id, submission_title, user_id, task_id")
    .in("id", submissionIds);

  const userIds = unique((submissions ?? []).map((s) => s.user_id));
  const taskIds = unique((submissions ?? []).map((s) => s.task_id));

  const [{ data: profiles }, { data: tasks }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds.length > 0 ? userIds : [NULL_UUID]),
    admin
      .from("tasks")
      .select("id, title")
      .in("id", taskIds.length > 0 ? taskIds : [NULL_UUID]),
  ]);

  const submissionsById = byId(submissions ?? [], (s) => s.id);
  const profilesById = byId(profiles ?? [], (p) => p.id);
  const tasksById = byId(tasks ?? [], (t) => t.id);

  return rows
    .map((r) => {
      const submission = submissionsById.get(r.submission_id);
      if (!submission) return null;
      const profile = profilesById.get(submission.user_id);
      const task = tasksById.get(submission.task_id);
      return {
        regradeId: r.id,
        submissionId: r.submission_id,
        submissionTitle: submission.submission_title,
        studentEmail: profile?.email ?? "(unknown)",
        taskTitle: task?.title ?? "(unknown task)",
        resolvedAt: r.resolved_at,
        status: r.status,
      };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);
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
