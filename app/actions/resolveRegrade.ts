"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";

export type ResolveRegradeState =
  | { status: "idle" }
  | { status: "success"; resolution: "resolved" | "declined" }
  | { status: "error"; message: string };

const HUMAN_MODEL_TAG = "human-review";

/**
 * Admin-only: resolves a regrade request and (when resolving)
 * overwrites the AI feedback row with the human-adjudicated scores +
 * commentary. Declining keeps the AI scores in place but records the
 * decision so the student sees the case is closed.
 *
 * Uses createAdminClient() for writes — feedback and regrade_requests
 * have no UPDATE policies for authenticated by design, so all admin
 * mutations bypass RLS via the service role.
 */
export async function resolveRegrade(
  _prev: ResolveRegradeState,
  formData: FormData,
): Promise<ResolveRegradeState> {
  // Guard FIRST. requireAdmin redirects on failure, but action calls
  // can be invoked outside a page render, so we also rely on the
  // service-role check below for defense in depth.
  await requireAdmin();

  const regradeId = String(formData.get("regrade_id") ?? "").trim();
  const resolution = String(formData.get("resolution") ?? "").trim();
  const adminNote = String(formData.get("admin_note") ?? "").trim() || null;

  if (!regradeId) {
    return { status: "error", message: "Missing regrade id." };
  }
  if (resolution !== "resolved" && resolution !== "declined") {
    return {
      status: "error",
      message: "Invalid resolution — must be 'resolved' or 'declined'.",
    };
  }

  const admin = createAdminClient();

  // Load the regrade request + submission/feedback context. We need
  // the submission_id to update feedback when resolving.
  const { data: regrade, error: regradeErr } = await admin
    .from("regrade_requests")
    .select("id, submission_id, status")
    .eq("id", regradeId)
    .maybeSingle();

  if (regradeErr || !regrade) {
    console.error("[resolveRegrade load]", regradeErr);
    return { status: "error", message: "Regrade request not found." };
  }
  if (regrade.status !== "pending") {
    return {
      status: "error",
      message: "This request is already resolved.",
    };
  }

  // If resolving, validate + apply the new feedback scores.
  if (resolution === "resolved") {
    const scores = {
      score_strategy: validateScore(formData.get("score_strategy")),
      score_execution: validateScore(formData.get("score_execution")),
      score_communication: validateScore(formData.get("score_communication")),
      score_technical: validateScore(formData.get("score_technical")),
      score_creativity: validateScore(formData.get("score_creativity")),
    };
    if (
      scores.score_strategy === null ||
      scores.score_execution === null ||
      scores.score_communication === null ||
      scores.score_technical === null ||
      scores.score_creativity === null
    ) {
      return {
        status: "error",
        message: "All five scores must be integers between 0 and 100.",
      };
    }

    const qualitative = String(
      formData.get("qualitative_feedback") ?? "",
    ).trim();
    if (!qualitative) {
      return {
        status: "error",
        message: "Written feedback can't be empty.",
      };
    }

    // Need the task weights to recompute the total — the source of
    // truth for the total lives on the feedback row itself, but the
    // weights come from the task. Joining via submission → task.
    const { data: submission } = await admin
      .from("submissions")
      .select("task_id")
      .eq("id", regrade.submission_id)
      .maybeSingle();

    if (!submission) {
      return { status: "error", message: "Submission not found." };
    }

    const { data: task } = await admin
      .from("tasks")
      .select(
        "weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
      )
      .eq("id", submission.task_id)
      .maybeSingle();

    if (!task) {
      return { status: "error", message: "Task not found." };
    }

    const totalRaw =
      scores.score_strategy * task.weight_strategy +
      scores.score_execution * task.weight_execution +
      scores.score_communication * task.weight_communication +
      scores.score_technical * task.weight_technical +
      scores.score_creativity * task.weight_creativity;
    const totalScore = Math.round(totalRaw * 10) / 10;

    const { error: feedbackErr } = await admin
      .from("feedback")
      .update({
        score_strategy: scores.score_strategy,
        score_execution: scores.score_execution,
        score_communication: scores.score_communication,
        score_technical: scores.score_technical,
        score_creativity: scores.score_creativity,
        total_score: totalScore,
        qualitative_feedback: qualitative,
        model_used: HUMAN_MODEL_TAG,
        generated_at: new Date().toISOString(),
      })
      .eq("submission_id", regrade.submission_id);

    if (feedbackErr) {
      console.error("[resolveRegrade feedback update]", feedbackErr);
      return {
        status: "error",
        message: "Couldn't save the new scores. Try again.",
      };
    }
  }

  // Mark the regrade row resolved/declined regardless of branch.
  const { error: updateErr } = await admin
    .from("regrade_requests")
    .update({
      status: resolution,
      resolved_at: new Date().toISOString(),
      admin_note: adminNote,
    })
    .eq("id", regradeId);

  if (updateErr) {
    console.error("[resolveRegrade status update]", updateErr);
    return {
      status: "error",
      message: "Couldn't update the request status. Try again.",
    };
  }

  // Bust caches so the list re-renders without the row in pending and
  // the student's submission page shows the new state on next load.
  revalidatePath("/admin/regrades");
  revalidatePath(`/submissions/${regrade.submission_id}`);

  return {
    status: "success",
    resolution: resolution as "resolved" | "declined",
  };
}

function validateScore(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const n = Number(String(v).trim());
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 0 || rounded > 100) return null;
  return rounded;
}
