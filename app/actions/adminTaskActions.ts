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
 *  chain on submissions.task_id (on delete cascade). Also purges the
 *  task's storage attachments from the task-attachments bucket and
 *  decrements the company's storage_bytes_used so the 500 MB quota
 *  reflects only the files that still exist. */
export async function adminDeleteTask(formData: FormData): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  // Pull what we need to clean up BEFORE the delete cascade.
  const { data: task } = await admin
    .from("tasks")
    .select("company_id, attachments")
    .eq("id", id)
    .maybeSingle();

  type Attachment = { storage_path?: string; size?: number };
  const attachments: Attachment[] = Array.isArray(task?.attachments)
    ? (task.attachments as Attachment[])
    : [];
  const storagePaths = attachments
    .map((a) => a.storage_path)
    .filter((p): p is string => typeof p === "string" && p.length > 0);
  const bytesToFree = attachments.reduce(
    (sum, a) => sum + (typeof a.size === "number" ? a.size : 0),
    0,
  );

  // Best-effort storage purge — if this fails we still proceed with
  // the DB delete; the worst outcome is an orphaned file rather than
  // a half-deleted task. Errors get logged for admin follow-up.
  if (storagePaths.length > 0) {
    const { error: storageErr } = await admin.storage
      .from("task-attachments")
      .remove(storagePaths);
    if (storageErr) {
      console.error("[adminDeleteTask storage]", storageErr);
    }
  }

  const { error } = await admin.from("tasks").delete().eq("id", id);
  if (error) {
    console.error("[adminDeleteTask]", error);
    redirect(`/admin/tasks?err=${encodeURIComponent(error.message)}`);
  }

  // Decrement the company's storage counter so future uploads see the
  // freed bytes. Best-effort — wrong by N bytes is recoverable; a
  // failed delete already short-circuited above.
  if (bytesToFree > 0 && task?.company_id) {
    try {
      const { data: companyRow } = await admin
        .from("companies")
        .select("storage_bytes_used")
        .eq("id", task.company_id)
        .maybeSingle();
      const current = companyRow?.storage_bytes_used ?? 0;
      const next = Math.max(0, current - bytesToFree);
      await admin
        .from("companies")
        .update({ storage_bytes_used: next })
        .eq("id", task.company_id);
    } catch (err) {
      console.error("[adminDeleteTask storage stamp]", err);
    }
  }

  revalidatePath("/admin/tasks");
  redirect("/admin/tasks?deleted=1");
}
