import Link from "next/link";
import { requireStudentUser } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { CvBuilderForm } from "@/components/CvBuilderForm";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Pick which completed tasks to include in your RuneShips CV
 *  block. Server-side: lists every task the user has a feedback
 *  row for. Client form handles checkboxes + preview + copy. */
export default async function CvBuilderPage() {
  const { user } = await requireStudentUser();
  const admin = createAdminClient();

  const { data: subs } = await admin
    .from("submissions")
    .select("id, task_id, created_at")
    .eq("user_id", user.id);

  const submissionIds = (subs ?? []).map((s) => s.id);
  const taskIds = Array.from(new Set((subs ?? []).map((s) => s.task_id)));

  const [feedbackRes, tasksRes] = await Promise.all([
    submissionIds.length > 0
      ? admin
          .from("feedback")
          .select("submission_id, total_score, generated_at")
          .in("submission_id", submissionIds)
      : Promise.resolve({ data: [], error: null }),
    taskIds.length > 0
      ? admin
          .from("tasks")
          .select("id, title, category, company_id")
          .in("id", taskIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const fbBySub = new Map(
    (feedbackRes.data ?? []).map((f) => [f.submission_id, f]),
  );
  const taskById = new Map(
    (tasksRes.data ?? []).map((t) => [t.id, t]),
  );

  // Companies for display in the row.
  const companyIds = Array.from(
    new Set((tasksRes.data ?? []).map((t) => t.company_id)),
  );
  const { data: companies } = companyIds.length
    ? await admin.from("companies").select("id, name").in("id", companyIds)
    : { data: [] };
  const companyById = new Map((companies ?? []).map((c) => [c.id, c]));

  // Best (highest-scoring) submission per task.
  type Row = {
    taskId: string;
    title: string;
    companyName: string;
    category: string;
    totalScore: number;
    completedAt: string;
  };
  const bestPerTask = new Map<string, Row>();
  for (const s of subs ?? []) {
    const fb = fbBySub.get(s.id);
    if (!fb) continue;
    const task = taskById.get(s.task_id);
    if (!task) continue;
    const cur = bestPerTask.get(task.id);
    if (!cur || fb.total_score > cur.totalScore) {
      bestPerTask.set(task.id, {
        taskId: task.id,
        title: task.title,
        companyName: companyById.get(task.company_id)?.name ?? "(unknown)",
        category: task.category,
        totalScore: fb.total_score,
        completedAt: fb.generated_at ?? s.created_at,
      });
    }
  }

  const rows = Array.from(bestPerTask.values()).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[920px]">
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/dashboard"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Dashboard
          </Link>
        </nav>

        <header className="mt-7">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            CV builder
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.4vw + 1rem, 3rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Add RuneShips to your CV.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-muted max-w-[62ch]">
            Pick the tasks you want featured. We&rsquo;ll assemble a copyable
            CV block: one line about your standing on RuneShips, then a
            numbered list of the tasks you selected with short descriptions.
          </p>
        </header>

        <div className="mt-12">
          {rows.length === 0 ? (
            <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
              <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
                Nothing to include yet
              </p>
              <p className="mt-4 font-display font-light text-[22px] sm:text-[24px] leading-[1.2] text-ink">
                Complete at least one task first.
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-muted max-w-[60ch]">
                Your CV block needs tasks with AI feedback. Head to the
                dashboard, pick something to work on, and come back once
                you&rsquo;ve received a score.
              </p>
              <Link
                href="/dashboard"
                className="link-anim mt-6 inline-block text-[14px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
              >
                Browse tasks <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            <CvBuilderForm
              tasks={rows.map((r) => ({
                taskId: r.taskId,
                title: r.title,
                companyName: r.companyName,
                category: r.category,
                totalScore: Math.round(r.totalScore),
                completedAt: r.completedAt,
                completedAtRelative: timeAgo(r.completedAt),
              }))}
            />
          )}
        </div>
      </div>
    </main>
  );
}
