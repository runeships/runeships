import Link from "next/link";
import { requireStudentUser } from "@/lib/account";
import { createClient } from "@/lib/supabase-server";
import { TaskGrid, type TaskForGrid } from "@/components/TaskGrid";

export const dynamic = "force-dynamic";

type CompanyMin = { slug: string; name: string; is_practice: boolean };
type TaskRowRaw = TaskForGrid & {
  order_index: number;
  created_at: string;
  company: CompanyMin | CompanyMin[] | null;
};

function normalizeRelation<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

/** Full list of every published task — students arrive here from
 *  the dashboard's 'View all →' link. Uses the same TaskGrid the
 *  dashboard does, so search + category filter come free. Sort
 *  pins practice first, then most-recent real. */
export default async function AllTasksPage() {
  await requireStudentUser();
  const supabase = await createClient();

  const result = await supabase
    .from("tasks")
    .select(
      `
        id, slug, title, brief, submission_mode, estimated_time, order_index, category, created_at,
        weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity,
        company:companies (slug, name, is_practice)
      `,
    )
    .eq("is_published", true);

  const raw = (result.data ?? []) as unknown as TaskRowRaw[];
  const normalized = raw.map((t) => ({
    ...t,
    company: normalizeRelation(t.company),
  }));
  normalized.sort((a, b) => {
    const ap = a.company?.is_practice ?? false;
    const bp = b.company?.is_practice ?? false;
    if (ap && !bp) return -1;
    if (!ap && bp) return 1;
    if (ap && bp) return a.order_index - b.order_index;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const tasks: TaskForGrid[] = normalized.map(
    ({ order_index: _o, created_at: _c, ...rest }) => {
      void _o;
      void _c;
      return rest;
    },
  );

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1240px]">
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
            Tasks
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.4vw + 1rem, 3rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            All available tasks.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-muted max-w-[62ch]">
            Every published task across practice briefs and real companies.
            Filter by category or search by keyword. Practice tasks are
            highlighted so you can tell at a glance which are sandbox briefs
            and which come from companies hiring.
          </p>
        </header>

        <div className="mt-12">
          {tasks.length === 0 ? (
            <p className="text-[15px] leading-[1.55] text-muted">
              No tasks published yet.
            </p>
          ) : (
            <TaskGrid tasks={tasks} />
          )}
        </div>
      </div>
    </main>
  );
}
