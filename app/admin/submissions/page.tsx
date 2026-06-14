import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminTaskList } from "@/components/AdminTaskList";

export const dynamic = "force-dynamic";

/** Admin landing for the release queue. Tasks (not individual
 *  submissions) are the unit here — click a task to see its
 *  ranked submissions with full feedback. */
export default async function AdminSubmissionsPage() {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const admin = createAdminClient();

  const [tasksRes, submissionsRes, companiesRes, profilesRes] =
    await Promise.all([
      admin
        .from("tasks")
        .select(
          "id, title, company_id, created_at, ai_token_budget, ai_tokens_used, is_demo",
        ),
      admin
        .from("submissions")
        .select("id, task_id, user_id, released_to_company, created_at"),
      admin.from("companies").select("id, name, is_practice"),
      admin.from("profiles").select("id, is_seed"),
    ]);

  const tasks = tasksRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const companyById = new Map(
    (companiesRes.data ?? []).map((c) => [c.id, c]),
  );
  const isSeedById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.is_seed]),
  );

  type Stats = {
    total: number;
    pending: number;
    released: number;
    /** Count of submissions whose student profile has is_seed=true.
     *  Demo activity from AI-generated personas. */
    seedCount: number;
    /** Count from real human users (is_seed=false / unknown). */
    realCount: number;
    lastSubmittedAt: string | null;
  };
  const stats = new Map<string, Stats>();
  for (const s of submissions) {
    const cur = stats.get(s.task_id) ?? {
      total: 0,
      pending: 0,
      released: 0,
      seedCount: 0,
      realCount: 0,
      lastSubmittedAt: null,
    };
    cur.total++;
    if (s.released_to_company) cur.released++;
    else cur.pending++;
    if (isSeedById.get(s.user_id) === true) cur.seedCount++;
    else cur.realCount++;
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
    .map((t) => {
      const company = companyById.get(t.company_id);
      return {
        id: t.id,
        title: t.title,
        companyName: company?.name ?? "(unknown)",
        isDemo: t.is_demo || company?.is_practice === true,
        budgetExhausted: t.ai_tokens_used >= t.ai_token_budget,
        stats: stats.get(t.id)!,
      };
    })
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

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <AdminNav current="submissions" email={adminEmail} />
        <div className="mt-10">
          <AdminTaskList rows={rows} />
        </div>
      </div>
    </main>
  );
}
