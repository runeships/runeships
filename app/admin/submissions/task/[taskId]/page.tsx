import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminTaskSubmissionsView } from "@/components/AdminTaskSubmissionsView";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminTaskSubmissionsPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const { taskId } = await params;
  const admin = createAdminClient();

  const { data: task } = await admin
    .from("tasks")
    .select(
      "id, title, brief, category, submission_mode, evaluation_mode, company_id, created_at, ai_token_budget, ai_tokens_used",
    )
    .eq("id", taskId)
    .maybeSingle();
  if (!task) notFound();

  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", task.company_id)
    .maybeSingle();

  const { data: submissions } = await admin
    .from("submissions")
    .select(
      "id, user_id, submission_title, submission_body, supporting_link, released_to_company, released_at, created_at",
    )
    .eq("task_id", task.id)
    .order("created_at", { ascending: false });

  const submissionIds = (submissions ?? []).map((s) => s.id);
  const userIds = Array.from(
    new Set((submissions ?? []).map((s) => s.user_id)),
  );

  const [feedbackRes, profilesRes] = await Promise.all([
    submissionIds.length > 0
      ? admin
          .from("feedback")
          .select(
            "submission_id, score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score, qualitative_feedback, model_used, generated_at",
          )
          .in("submission_id", submissionIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length > 0
      ? admin
          .from("profiles")
          .select("id, full_name, email, school, graduation_year")
          .in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const fbBySub = new Map(
    (feedbackRes.data ?? []).map((f) => [f.submission_id, f]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );

  const rows = (submissions ?? []).map((s) => {
    const fb = fbBySub.get(s.id);
    const studentProfile = profileById.get(s.user_id);
    return {
      submissionId: s.id,
      submissionTitle: s.submission_title,
      submissionBody: s.submission_body,
      supportingLink: s.supporting_link,
      createdAt: s.created_at,
      releasedToCompany: s.released_to_company,
      releasedAt: s.released_at,
      studentName: studentProfile?.full_name ?? "(unnamed)",
      studentEmail: studentProfile?.email ?? null,
      studentSchool: studentProfile?.school ?? null,
      studentGradYear: studentProfile?.graduation_year ?? null,
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
      qualitativeFeedback: fb?.qualitative_feedback ?? null,
      modelUsed: fb?.model_used ?? null,
      generatedAt: fb?.generated_at ?? null,
    };
  });

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <AdminNav current="submissions" email={adminEmail} />

        <nav
          aria-label="Breadcrumb"
          className="mt-10 text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/admin/submissions"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> All tasks
          </Link>
        </nav>

        <header className="mt-6">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Task
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
            Posted {timeAgo(task.created_at)}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {task.evaluation_mode === "human"
              ? "AI + human reviewer"
              : "AI feedback only"}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            AI tokens: {task.ai_tokens_used.toLocaleString()} /{" "}
            {task.ai_token_budget.toLocaleString()}
          </p>
        </header>

        <div className="mt-10">
          <AdminTaskSubmissionsView taskBrief={task.brief} rows={rows} />
        </div>
      </div>
    </main>
  );
}
