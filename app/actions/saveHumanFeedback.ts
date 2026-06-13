"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { notifyStudentOfFeedback } from "@/lib/emails";

export type SaveHumanFeedbackState =
  | { status: "idle" }
  | { status: "error"; message: string };

const HUMAN_MODEL_TAG = "human-reviewer";

/**
 * Admin-only: persist a human-reviewed feedback row for a submission
 * whose task is evaluation_mode='human'. Validates each score in
 * [0, 100], recomputes the weighted total from the task's per-dim
 * weights, INSERTs via the service-role admin client, then emails
 * the student (if they're opted in).
 *
 * Redirects to /admin on success.
 */
export async function saveHumanFeedback(
  _prev: SaveHumanFeedbackState,
  formData: FormData,
): Promise<SaveHumanFeedbackState> {
  await requireAdmin();

  const submissionId = String(formData.get("submission_id") ?? "").trim();
  if (!submissionId) {
    return { status: "error", message: "Missing submission id." };
  }

  // Validate the five scores.
  const scores = {
    strategy: validateScore(formData.get("score_strategy")),
    execution: validateScore(formData.get("score_execution")),
    communication: validateScore(formData.get("score_communication")),
    technical: validateScore(formData.get("score_technical")),
    creativity: validateScore(formData.get("score_creativity")),
  };
  if (
    scores.strategy === null ||
    scores.execution === null ||
    scores.communication === null ||
    scores.technical === null ||
    scores.creativity === null
  ) {
    return {
      status: "error",
      message: "All five scores must be integers between 0 and 100.",
    };
  }

  const qualitative = String(formData.get("qualitative_feedback") ?? "").trim();
  if (qualitative.length === 0) {
    return { status: "error", message: "Qualitative feedback can't be empty." };
  }
  if (qualitative.length > 4000) {
    return {
      status: "error",
      message: "Qualitative feedback is too long — keep it under 4,000 characters.",
    };
  }

  const admin = createAdminClient();

  // Load submission + task + student in parallel.
  const { data: submission } = await admin
    .from("submissions")
    .select("id, user_id, task_id, submission_title")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission) {
    return { status: "error", message: "Submission not found." };
  }

  const [taskRes, studentRes, existingRes] = await Promise.all([
    admin
      .from("tasks")
      .select(
        "id, title, evaluation_mode, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
      )
      .eq("id", submission.task_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("id, email, full_name, notify_on_feedback")
      .eq("id", submission.user_id)
      .maybeSingle(),
    admin
      .from("feedback")
      .select("id")
      .eq("submission_id", submissionId)
      .maybeSingle(),
  ]);

  if (!taskRes.data) {
    return { status: "error", message: "Task not found." };
  }
  if (taskRes.data.evaluation_mode !== "human") {
    return {
      status: "error",
      message: "This task is AI-evaluated. Use the generateFeedback flow instead.",
    };
  }
  if (existingRes.data) {
    return {
      status: "error",
      message: "Feedback already exists for this submission. Use a regrade request to overwrite.",
    };
  }

  // Compute weighted total from the task's per-dim weights.
  const task = taskRes.data;
  const totalRaw =
    scores.strategy * task.weight_strategy +
    scores.execution * task.weight_execution +
    scores.communication * task.weight_communication +
    scores.technical * task.weight_technical +
    scores.creativity * task.weight_creativity;
  const totalScore = Math.round(totalRaw * 10) / 10;

  const { error: insertErr } = await admin.from("feedback").insert({
    submission_id: submissionId,
    score_strategy: scores.strategy,
    score_execution: scores.execution,
    score_communication: scores.communication,
    score_technical: scores.technical,
    score_creativity: scores.creativity,
    total_score: totalScore,
    qualitative_feedback: qualitative,
    model_used: HUMAN_MODEL_TAG,
  });

  if (insertErr) {
    console.error("[saveHumanFeedback insert]", insertErr);
    return {
      status: "error",
      message: "Couldn't save the feedback. Try again.",
    };
  }

  // Notify the student (respects their notify_on_feedback flag).
  if (studentRes.data) {
    await notifyStudentOfFeedback({
      submissionId,
      studentEmail: studentRes.data.email,
      studentName: studentRes.data.full_name,
      taskTitle: task.title,
      totalScore,
      notifyOnFeedback: studentRes.data.notify_on_feedback,
      source: "human",
    });
  }

  revalidatePath("/admin");
  revalidatePath(`/submissions/${submissionId}`);
  redirect("/admin");
}

function validateScore(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 0 || rounded > 100) return null;
  return rounded;
}
