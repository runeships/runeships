import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { timeAgo } from "@/lib/format";
import { Pencil, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

/** Admin-side task management. Lists every task across companies,
 *  highlights pending deletion requests, and links to per-task edit. */
export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; err?: string }>;
}) {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const sp = await searchParams;
  const admin = createAdminClient();

  const [tasksRes, companiesRes, submissionsRes] = await Promise.all([
    admin
      .from("tasks")
      .select(
        "id, title, slug, category, submission_mode, evaluation_mode, is_published, is_demo, company_id, deletion_requested_at, deletion_request_note, created_at",
      )
      .order("deletion_requested_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    admin.from("companies").select("id, name, slug, is_practice"),
    admin.from("submissions").select("task_id"),
  ]);

  const tasks = tasksRes.data ?? [];
  const companyById = new Map(
    (companiesRes.data ?? []).map((c) => [c.id, c]),
  );
  const submissionCount = new Map<string, number>();
  for (const s of submissionsRes.data ?? []) {
    submissionCount.set(s.task_id, (submissionCount.get(s.task_id) ?? 0) + 1);
  }

  const pendingDeletion = tasks.filter((t) => t.deletion_requested_at);
  const others = tasks.filter((t) => !t.deletion_requested_at);

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <AdminNav current="tasks" email={adminEmail} />

        {sp.deleted && (
          <p className="mt-8 text-[13px] text-oxblood">
            Task deleted.
          </p>
        )}
        {sp.err && (
          <p className="mt-8 text-[13px] text-oxblood">
            Couldn&rsquo;t delete: {decodeURIComponent(sp.err)}
          </p>
        )}

        {pendingDeletion.length > 0 && (
          <section className="mt-10">
            <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
              Deletion requests · {pendingDeletion.length}
            </p>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {pendingDeletion.map((t) => {
                const company = companyById.get(t.company_id);
                return (
                  <Row
                    key={t.id}
                    task={t}
                    companyName={company?.name ?? "(unknown)"}
                    isPracticeCompany={company?.is_practice === true}
                    submissions={submissionCount.get(t.id) ?? 0}
                  />
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-14">
          <p className="text-[11px] tracking-[0.20em] uppercase text-muted">
            All tasks · {tasks.length}
          </p>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {others.map((t) => {
              const company = companyById.get(t.company_id);
              return (
                <Row
                  key={t.id}
                  task={t}
                  companyName={company?.name ?? "(unknown)"}
                  isPracticeCompany={company?.is_practice === true}
                  submissions={submissionCount.get(t.id) ?? 0}
                />
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Row({
  task,
  companyName,
  isPracticeCompany,
  submissions,
}: {
  task: {
    id: string;
    title: string;
    category: string;
    is_published: boolean;
    is_demo: boolean;
    deletion_requested_at: string | null;
    deletion_request_note: string | null;
    created_at: string;
  };
  companyName: string;
  isPracticeCompany: boolean;
  submissions: number;
}) {
  const isDemoTask = task.is_demo || isPracticeCompany;
  return (
    <li className="py-4 flex items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
            {task.title}
          </p>
          {task.deletion_requested_at && (
            <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-oxblood">
              <AlertTriangle size={11} strokeWidth={1.8} />
              Deletion requested
            </span>
          )}
          {isDemoTask && (
            <span className="inline-flex items-center px-2 min-h-[18px] bg-ink/10 text-ink/60 text-[10px] tracking-[0.04em] uppercase">
              Demo
            </span>
          )}
          {!task.is_published && (
            <span className="text-[10px] tracking-[0.06em] uppercase text-muted">
              Hidden
            </span>
          )}
        </div>
        <p className="mt-1 text-[12px] text-muted truncate">
          {companyName}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          {task.category}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          {submissions} {submissions === 1 ? "submission" : "submissions"}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Posted {timeAgo(task.created_at)}
        </p>
        {task.deletion_request_note && (
          <p className="mt-2 text-[12px] text-muted italic max-w-[80ch]">
            &ldquo;{task.deletion_request_note}&rdquo;
          </p>
        )}
      </div>
      <Link
        href={`/admin/tasks/${task.id}/edit`}
        className="
          inline-flex items-center gap-1.5 shrink-0
          text-[13px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover
          link-anim transition-colors duration-200 ease-out
        "
      >
        <Pencil size={12} strokeWidth={1.8} />
        Edit
      </Link>
    </li>
  );
}
