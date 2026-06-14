import Link from "next/link";
import { requireStudentUser } from "@/lib/account";
import { createClient } from "@/lib/supabase-server";
import { AllSubmissionsList } from "@/components/AllSubmissionsList";

export const dynamic = "force-dynamic";

type Raw = {
  id: string;
  submission_title: string;
  created_at: string;
  task:
    | { title: string; company: { name: string } | { name: string }[] | null }
    | { title: string; company: { name: string } | { name: string }[] | null }[]
    | null;
  feedback:
    | { total_score: number }
    | { total_score: number }[]
    | null;
};

function normalizeRelation<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

/** Full list of the student's own submissions. Linked from the
 *  dashboard's 'View all →' on the submissions section. */
export default async function AllSubmissionsPage() {
  await requireStudentUser();
  const supabase = await createClient();

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

  const raw = (result.data ?? []) as unknown as Raw[];
  const rows = raw.map((s) => {
    const task = normalizeRelation(s.task);
    const fb = normalizeRelation(s.feedback);
    return {
      id: s.id,
      submissionTitle: s.submission_title,
      createdAt: s.created_at,
      taskTitle: task?.title ?? null,
      companyName: task ? normalizeRelation(task.company)?.name ?? null : null,
      totalScore: fb?.total_score ?? null,
    };
  });

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
            Submissions
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.4vw + 1rem, 3rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Your submissions.
          </h1>
          <p className="mt-5 text-[15px] leading-[1.6] text-muted max-w-[58ch]">
            Every task you&rsquo;ve submitted, with the score the AI gave
            you. Sort by newest, by overall score, or by submission title.
          </p>
        </header>

        <div className="mt-12">
          {rows.length === 0 ? (
            <p className="text-[15px] leading-[1.55] text-muted max-w-[44ch]">
              You haven&rsquo;t submitted any tasks yet. Pick one from the{" "}
              <Link
                href="/tasks"
                className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
              >
                tasks list
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <AllSubmissionsList rows={rows} />
          )}
        </div>
      </div>
    </main>
  );
}
