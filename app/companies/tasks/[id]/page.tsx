import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompanyUser } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import { CompanySubmissionsTable } from "@/components/CompanySubmissionsTable";
import { RequestDeletionButton } from "@/components/RequestDeletionButton";
import { timeAgo } from "@/lib/format";
import { File as FileIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type Attachment = {
  filename: string;
  url: string;
  size: number;
  content_type: string;
  storage_path: string;
};

export default async function CompanyTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireCompanyUser();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: task } = await admin
    .from("tasks")
    .select(
      "id, slug, title, brief, category, submission_mode, evaluation_mode, created_at, company_id, attachments, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity, deletion_requested_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!task || task.company_id !== company.id) notFound();

  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, user_id, submission_title, supporting_link, created_at",
    )
    .eq("task_id", task.id)
    .eq("released_to_company", true)
    .order("created_at", { ascending: false });

  // Count of submissions still waiting on admin release — shown
  // as a small "N pending RuneShips review" note so the company
  // knows work is in flight even when the table looks empty. Wrap
  // in try/catch so an unmigrated schema doesn't crash the page.
  let pendingReviewCount = 0;
  try {
    const { count } = await admin
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("task_id", task.id)
      .eq("released_to_company", false);
    pendingReviewCount = count ?? 0;
  } catch (err) {
    console.error("[companies/tasks pending count]", err);
  }

  const submissionIds = (submissions ?? []).map((s) => s.id);
  const userIds = Array.from(
    new Set((submissions ?? []).map((s) => s.user_id)),
  );

  const [feedbackRes, profilesRes] = await Promise.all([
    submissionIds.length > 0
      ? admin
          .from("feedback")
          .select(
            "submission_id, score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score",
          )
          .in("submission_id", submissionIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, school, graduation_year")
          .in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const fbBySubmission = new Map(
    (feedbackRes.data ?? []).map((f) => [f.submission_id, f]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const rows = (submissions ?? []).map((s) => {
    const fb = fbBySubmission.get(s.id);
    const profile = profileById.get(s.user_id);
    return {
      submissionId: s.id,
      submissionTitle: s.submission_title,
      supportingLink: s.supporting_link,
      createdAt: s.created_at,
      studentName: profile?.full_name ?? "(unnamed)",
      school: profile?.school ?? null,
      gradYear: profile?.graduation_year ?? null,
      hasFeedback: Boolean(fb),
      scores: fb
        ? {
            strategy: fb.score_strategy,
            execution: fb.score_execution,
            communication: fb.score_communication,
            technical: fb.score_technical,
            creativity: fb.score_creativity,
            total: fb.total_score,
          }
        : null,
    };
  });
  const ranked = rows.flatMap((r) =>
    r.hasFeedback && r.scores !== null
      ? [{ ...r, hasFeedback: true as const, scores: r.scores }]
      : [],
  );
  const pending = rows
    .filter((r) => !r.hasFeedback)
    .map((r) => ({
      submissionId: r.submissionId,
      studentName: r.studentName,
      createdAt: r.createdAt,
    }));

  // Attachments JSON cast.
  let attachments: Attachment[] = [];
  if (Array.isArray(task.attachments)) {
    attachments = task.attachments as unknown as Attachment[];
  }

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/companies/dashboard"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Dashboard
          </Link>
        </nav>

        <header className="mt-7">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Task
          </p>
          <h1
            className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
            style={{
              fontSize: "clamp(2rem, 3.4vw + 1rem, 3rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {task.title}
          </h1>
          <p className="mt-4 text-[12px] tracking-[0.06em] uppercase text-muted">
            Posted {timeAgo(task.created_at)}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {task.category}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {task.submission_mode.replace(/_/g, " ")}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {task.evaluation_mode === "human" ? "Human review" : "AI feedback"}
          </p>
        </header>

        {attachments.length > 0 && (
          <section className="mt-12">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
              Files
            </p>
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {attachments.map((a) => (
                <li key={a.storage_path}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={a.filename}
                    className="flex items-center gap-3 py-3 -mx-3 px-3 hover:bg-parchment/60 transition-colors duration-200 ease-out group"
                  >
                    <FileIcon
                      aria-hidden
                      size={16}
                      strokeWidth={1.5}
                      className="text-oxblood shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] tracking-[-0.005em] text-oxblood group-hover:text-oxblood-hover underline decoration-oxblood/40 underline-offset-[3px] truncate">
                        {a.filename}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted shrink-0">
                      {prettySize(a.size)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
            Brief
          </p>
          {task.brief?.trim() ? (
            <EditorialMarkdown content={task.brief.trim()} />
          ) : (
            <p className="text-[15px] text-muted italic">
              (No description provided.)
            </p>
          )}
        </section>

        <section className="mt-16 sm:mt-20">
          <div>
            <h2
              className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink"
              style={{ fontSize: "clamp(1.75rem, 1.4vw + 1rem, 2rem)" }}
            >
              Submissions
            </h2>
            <hr className="mt-5 border-0 border-t border-ink/10" />
          </div>

          {rows.length === 0 ? (
            <div className="mt-10 border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
              <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
                Awaiting submissions
              </p>
              <p className="mt-4 font-display font-light text-[22px] sm:text-[26px] leading-[1.2] text-ink">
                Your task is live.
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-muted max-w-[60ch]">
                {pendingReviewCount > 0
                  ? `${pendingReviewCount} submission${pendingReviewCount === 1 ? "" : "s"} pending RuneShips review — they'll appear here once vetted.`
                  : "Submissions will appear here as students complete it."}
              </p>
            </div>
          ) : (
            <>
              <CompanySubmissionsTable rows={ranked} pending={pending} />
              {pendingReviewCount > 0 && (
                <p className="mt-6 text-[12px] text-muted">
                  + {pendingReviewCount} more pending RuneShips review.
                </p>
              )}
            </>
          )}
        </section>

        <div className="mt-20 pt-8 border-t border-ink/10 flex flex-wrap items-start justify-between gap-y-6 gap-x-10">
          <Link
            href="/companies/dashboard"
            className="link-anim text-[14px] tracking-[0.005em] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
          <RequestDeletionButton
            taskId={task.id}
            alreadyRequestedAt={task.deletion_requested_at}
          />
        </div>
      </div>
    </main>
  );
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
