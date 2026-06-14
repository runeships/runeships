"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import type { UpdatableRow } from "@/lib/database.types";

export type AdminUpdateTaskState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "error"; message: string };

const CATEGORY_VALUES = [
  "writing",
  "deck",
  "code",
  "spreadsheet",
  "strategy",
  "design",
] as const;
const SUBMISSION_MODES = ["text_only", "link_only", "text_and_link"] as const;
const EVALUATION_MODES = ["ai", "human"] as const;

/** Admin can edit task metadata. Attachments + weights are not touched
 *  here — they're set at creation time and changing them after-the-fact
 *  invalidates any existing AI scores. */
export async function adminUpdateTask(
  _prev: AdminUpdateTaskState,
  formData: FormData,
): Promise<AdminUpdateTaskState> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Missing task id." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { status: "error", message: "Title required." };
  if (title.length > 200) {
    return { status: "error", message: "Title too long." };
  }
  const brief = String(formData.get("brief") ?? "");
  const categoryRaw = String(formData.get("category") ?? "");
  const submissionModeRaw = String(formData.get("submission_mode") ?? "");
  const evaluationModeRaw = String(formData.get("evaluation_mode") ?? "");
  const isPublished = formData.get("is_published") === "on";
  const clearDeletionRequest = formData.get("clear_deletion_request") === "on";
  const resetAiTokensUsed = formData.get("reset_ai_tokens_used") === "on";
  const rawBudget = Number(formData.get("ai_token_budget"));
  const aiTokenBudget =
    Number.isFinite(rawBudget) && rawBudget >= 0 ? Math.floor(rawBudget) : null;

  const category = (CATEGORY_VALUES as readonly string[]).includes(categoryRaw)
    ? (categoryRaw as (typeof CATEGORY_VALUES)[number])
    : "strategy";
  const submissionMode = (SUBMISSION_MODES as readonly string[]).includes(
    submissionModeRaw,
  )
    ? (submissionModeRaw as (typeof SUBMISSION_MODES)[number])
    : "link_only";
  const evaluationMode = (EVALUATION_MODES as readonly string[]).includes(
    evaluationModeRaw,
  )
    ? (evaluationModeRaw as (typeof EVALUATION_MODES)[number])
    : "ai";

  const patch: UpdatableRow<"tasks"> = {
    title,
    brief,
    category,
    submission_mode: submissionMode,
    evaluation_mode: evaluationMode,
    is_published: isPublished,
  };
  if (clearDeletionRequest) {
    patch.deletion_requested_at = null;
    patch.deletion_request_note = null;
  }
  if (aiTokenBudget !== null) {
    patch.ai_token_budget = aiTokenBudget;
  }
  if (resetAiTokensUsed) {
    patch.ai_tokens_used = 0;
  }

  const { error } = await admin.from("tasks").update(patch).eq("id", id);
  if (error) {
    console.error("[adminUpdateTask]", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${id}/edit`);
  return { status: "saved" };
}

/** Hard-delete a task. Cascades to submissions + feedback via the FK
 *  chain on submissions.task_id (on delete cascade). Storage objects
 *  in task-attachments are left orphan — they're cheap and the bucket
 *  doesn't have a cleanup-on-task-delete policy yet. */
export async function adminDeleteTask(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const { error } = await admin.from("tasks").delete().eq("id", id);
  if (error) {
    console.error("[adminDeleteTask]", error);
    redirect(`/admin/tasks?err=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/tasks");
  redirect("/admin/tasks?deleted=1");
}
