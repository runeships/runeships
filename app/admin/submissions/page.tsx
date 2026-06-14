import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { timeAgo } from "@/lib/format";
import { ArrowRight, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

/** Admin landing for the release queue. Tasks (not individual
 *  submissions) are the unit here — click a task to see its
 *  ranked submissions with full feedback. */
export default async function AdminSubmissionsPage() {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const admin = createAdminClient();

  const [tasksRes, submissionsRes, companiesRes] = await Promise.all([
    admin
      .from("tasks")
      .select(
        "id, title, company_id, created_at, ai_token_budget, ai_tokens_used, is_demo",
      ),
    admin
      .from("submissions")
      .select("id, task_id, released_to_company, created_at"),
    admin.from("companies").select("id, name"),
  ]);

  const tasks = tasksRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const companyById = new Map(
    (companiesRes.data ?? []).map((c) => [c.id, c]),
  );

  type Stats = {
    total: number;
    pending: number;
    released: number;
    lastSubmittedAt: string | null;
  };
  const stats = new Map<string, Stats>();
  for (const s of submissions) {
    const cur = stats.get(s.task_id) ?? {
      total: 0,
      pending: 0,
      released: 0,
      lastSubmittedAt: null,
    };
    cur.total++;
    if (s.released_to_company) cur.released++;
    else cur.pending++;
    if (
      !cur.lastSubmittedAt ||
      new Date(s.created_at) > new Date(cur.lastSubmittedAt)
    ) {
      cur.lastSubmittedAt = s.created_at;
    }
    stats.set(s.task_id, cur);
  }

  // Only show tasks that have ≥1 submission. Sort: pending first
  // (more = higher priority), then newest activity.
  const rows = tasks
    .filter((t) => stats.has(t.id))
    .map((t) => ({
      task: t,
      stats: stats.get(t.id)!,
      companyName: companyById.get(t.company_id)?.name ?? "(unknown)",
      budgetExhausted: t.ai_tokens_used >= t.ai_token_budget,
    }))
    .sort((a, b) => {
      if (b.stats.pending !== a.stats.pending) {
        return b.stats.pending - a.stats.pending;
      }
      const at = a.stats.lastSubmittedAt
        ? new Date(a.stats.lastSubmittedAt).getTime()
        : 0;
      const bt = b.stats.lastSubmittedAt
        ? new Date(b.stats.lastSubmittedAt).getTime()
        : 0;
      return bt - at;
    });

  const totalPending = rows.reduce((s, r) => s + r.stats.pending, 0);

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <AdminNav current="submissions" email={adminEmail} />

        <header className="mt-10">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Submissions
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(1.75rem, 2.6vw + 1rem, 2.4rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Tasks with submissions
          </h1>
          <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[68ch]">
            {rows.length} {rows.length === 1 ? "task" : "tasks"} ·{" "}
            {totalPending} submission{totalPending === 1 ? "" : "s"} pending
            release. Click a task to see ranked submissions with full feedback,
            and release them individually to the company.
          </p>
        </header>

        {rows.length === 0 ? (
          <p className="mt-12 text-[14px] text-muted italic">
            No submissions yet.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
            {rows.map(({ task, stats, companyName, budgetExhausted }) => (
              <li key={task.id}>
                <Link
                  href={`/admin/submissions/task/${task.id}`}
                  className="
                    py-5 grid grid-cols-[1fr_auto_auto] gap-x-6 items-center
                    -mx-3 px-3 group
                    hover:bg-parchment/60 transition-colors duration-200 ease-out
                  "
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                        {task.title}
                      </p>
                      {stats.pending > 0 && (
                        <span className="inline-flex items-center px-2 min-h-[18px] bg-oxblood text-cream text-[10px] tracking-[0.04em] uppercase">
                          {stats.pending} pending
                        </span>
                      )}
                      {budgetExhausted && (
                        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-oxblood">
                          <AlertTriangle size={11} strokeWidth={1.8} />
                          Budget exhausted
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-muted truncate">
                      {companyName}
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      {stats.total} total
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      {stats.released} released
                      {stats.lastSubmittedAt && (
                        <>
                          <span aria-hidden className="mx-2 text-muted/50">·</span>
                          Latest {timeAgo(stats.lastSubmittedAt)}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-[12px] text-muted tabular-nums shrink-0">
                    {stats.released}/{stats.total}
                  </span>
                  <span
                    aria-hidden
                    className="text-oxblood opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out shrink-0"
                  >
                    <ArrowRight size={16} strokeWidth={1.8} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
