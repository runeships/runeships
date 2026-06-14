import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminEditTaskForm } from "@/components/AdminEditTaskForm";

export const dynamic = "force-dynamic";

export default async function AdminEditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const { id } = await params;
  const admin = createAdminClient();

  const { data: task } = await admin
    .from("tasks")
    .select(
      "id, title, brief, category, submission_mode, evaluation_mode, is_published, deletion_requested_at, deletion_request_note, company_id, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!task) notFound();

  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", task.company_id)
    .maybeSingle();

  const { count: submissionsCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("task_id", id);

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[820px]">
        <AdminNav current="tasks" email={adminEmail} />

        <nav
          aria-label="Breadcrumb"
          className="mt-10 text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/admin/tasks"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> All tasks
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Edit task
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(1.75rem, 2.6vw + 1rem, 2.4rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {task.title}
          </h1>
          <p className="mt-3 text-[12px] tracking-[0.04em] uppercase text-muted">
            {company?.name ?? "(unknown company)"}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {submissionsCount ?? 0}{" "}
            {(submissionsCount ?? 0) === 1 ? "submission" : "submissions"}
          </p>
          {task.deletion_requested_at && (
            <div className="mt-6 border border-oxblood/40 bg-parchment/40 p-5">
              <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
                Deletion requested
              </p>
              {task.deletion_request_note && (
                <p className="mt-2 text-[13px] leading-[1.55] text-ink italic">
                  &ldquo;{task.deletion_request_note}&rdquo;
                </p>
              )}
              <p className="mt-3 text-[12px] text-muted">
                Use the Delete button below to remove the task (cascades to
                submissions + feedback), or tick &ldquo;Clear deletion
                request&rdquo; below to keep it live.
              </p>
            </div>
          )}
        </header>

        <div className="mt-10">
          <AdminEditTaskForm
            task={{
              id: task.id,
              title: task.title,
              brief: task.brief ?? "",
              category: task.category,
              submission_mode: task.submission_mode,
              evaluation_mode: task.evaluation_mode,
              is_published: task.is_published,
              has_deletion_request: Boolean(task.deletion_requested_at),
            }}
          />
        </div>
      </div>
    </main>
  );
}
