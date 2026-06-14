"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { notifyCompanyOfNewSubmission } from "@/lib/emails";

/**
 * Admin marks a submission as ready for the company to see. Flips
 * submissions.released_to_company → true, stamps released_at, and
 * fires the company-side "new submission" email (if the owner has
 * notify_on_new_submission enabled).
 *
 * Idempotent: re-running on an already-released submission updates
 * nothing and re-sends nothing. To re-send manually, an admin can
 * unrelease first.
 */
export async function releaseSubmissionToCompany(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("submission_id") ?? "").trim();
  if (!id) return;

  const { data: sub } = await admin
    .from("submissions")
    .select(
      "id, user_id, task_id, submission_title, released_to_company",
    )
    .eq("id", id)
    .maybeSingle();
  if (!sub) return;
  if (sub.released_to_company) {
    revalidatePath("/admin/submissions");
    return;
  }

  const { error } = await admin
    .from("submissions")
    .update({
      released_to_company: true,
      released_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    console.error("[releaseSubmission update]", error);
    return;
  }

  // Email the company owner. Best-effort — release stands either way.
  try {
    const { data: task } = await admin
      .from("tasks")
      .select("id, title, company_id")
      .eq("id", sub.task_id)
      .maybeSingle();
    if (!task) return;

    const [ownerRes, studentRes, scoreRes] = await Promise.all([
      admin
        .from("profiles")
        .select("email, notify_on_new_submission")
        .eq("company_id", task.company_id)
        .eq("account_type", "company")
        .maybeSingle(),
      admin
        .from("profiles")
        .select("full_name")
        .eq("id", sub.user_id)
        .maybeSingle(),
      admin
        .from("feedback")
        .select("total_score")
        .eq("submission_id", sub.id)
        .maybeSingle(),
    ]);

    const owner = ownerRes.data;
    if (owner?.notify_on_new_submission && owner.email) {
      await notifyCompanyOfNewSubmission({
        recipientEmail: owner.email,
        studentName:
          studentRes.data?.full_name ?? sub.submission_title ?? "(unnamed)",
        taskTitle: task.title,
        taskId: task.id,
        totalScore: scoreRes.data?.total_score ?? null,
      });
    }
  } catch (err) {
    console.error("[releaseSubmission notify]", err);
  }

  revalidatePath("/admin/submissions");
  revalidatePath(`/companies/tasks/${sub.task_id}`);
}

/** Reverse a release. Useful if admin clicked too fast. */
export async function unreleaseSubmission(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("submission_id") ?? "").trim();
  if (!id) return;
  const { data: sub } = await admin
    .from("submissions")
    .select("task_id")
    .eq("id", id)
    .maybeSingle();
  await admin
    .from("submissions")
    .update({ released_to_company: false, released_at: null })
    .eq("id", id);
  revalidatePath("/admin/submissions");
  if (sub) revalidatePath(`/companies/tasks/${sub.task_id}`);
}
