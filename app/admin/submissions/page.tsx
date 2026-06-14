import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminSubmissionsList } from "@/components/AdminSubmissionsList";

export const dynamic = "force-dynamic";

/** Admin view of every submission across all tasks. Sortable by
 *  overall score or any single dimension. Each row has Release /
 *  Unrelease buttons that drive what companies see on their side. */
export default async function AdminSubmissionsPage() {
  const { user, profile } = await requireAdmin();
  const adminEmail = profile?.email ?? user.email ?? "(admin)";
  const admin = createAdminClient();

  const [submissionsRes, tasksRes, companiesRes, profilesRes, feedbackRes] =
    await Promise.all([
      admin
        .from("submissions")
        .select(
          "id, user_id, task_id, submission_title, supporting_link, released_to_company, released_at, created_at",
        )
        .order("created_at", { ascending: false }),
      admin.from("tasks").select("id, title, company_id, ai_token_budget, ai_tokens_used"),
      admin.from("companies").select("id, name"),
      admin.from("profiles").select("id, full_name, school, graduation_year"),
      admin
        .from("feedback")
        .select(
          "submission_id, score_strategy, score_execution, score_communication, score_technical, score_creativity, total_score",
        ),
    ]);

  const taskById = new Map((tasksRes.data ?? []).map((t) => [t.id, t]));
  const companyById = new Map(
    (companiesRes.data ?? []).map((c) => [c.id, c]),
  );
  const profileById = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p]),
  );
  const fbBySub = new Map(
    (feedbackRes.data ?? []).map((f) => [f.submission_id, f]),
  );

  const rows = (submissionsRes.data ?? []).map((s) => {
    const task = taskById.get(s.task_id);
    const company = task ? companyById.get(task.company_id) : null;
    const studentProfile = profileById.get(s.user_id);
    const fb = fbBySub.get(s.id);
    return {
      submissionId: s.id,
      submissionTitle: s.submission_title,
      supportingLink: s.supporting_link,
      createdAt: s.created_at,
      releasedToCompany: s.released_to_company,
      releasedAt: s.released_at,
      taskId: task?.id ?? null,
      taskTitle: task?.title ?? "(deleted task)",
      companyName: company?.name ?? "(unknown)",
      budgetExhausted:
        task != null && task.ai_tokens_used >= task.ai_token_budget,
      studentName: studentProfile?.full_name ?? "(unnamed)",
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
    };
  });

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1180px]">
        <AdminNav current="submissions" email={adminEmail} />
        <div className="mt-10">
          <AdminSubmissionsList rows={rows} />
        </div>
      </div>
    </main>
  );
}
