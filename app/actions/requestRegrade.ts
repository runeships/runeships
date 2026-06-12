"use server";

import { createClient } from "@/lib/supabase-server";
import { resend, RESEND_FROM } from "@/lib/resend";

// Where regrade notifications land. Hardcoded for now — promote to env
// var the moment there's more than one admin or a staging env that
// shouldn't ping the prod inbox.
const ADMIN_EMAIL = "diego.marjotie@gmail.com";

export type RequestRegradeResult =
  | { success: true }
  | {
      success: false;
      error:
        | "unauthorized"
        | "submission_not_found"
        | "no_feedback"
        | "already_requested"
        | "insert_failed";
    };

/**
 * Records a student's request for human regrade of a submission.
 * Idempotent at the table level (UNIQUE submission_id) and again
 * defensively in this action so the UI gets a clean error path
 * instead of a constraint violation surface.
 *
 * Does NOT call Anthropic — that's the whole point. A human picks
 * this up out-of-band via the admin email.
 *
 * Best-effort emails the admin on success. If Resend errors we log
 * and still return success — the row is the source of truth, the
 * email is just a nudge.
 */
export async function requestRegrade(
  submissionId: string,
): Promise<RequestRegradeResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthorized" };

  // Ownership check (RLS would also block it, but doing it here gives
  // us the submission record for the email payload).
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, submission_title, task_id, user_id, created_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (!submission || submission.user_id !== user.id) {
    return { success: false, error: "submission_not_found" };
  }

  // Can't dispute what doesn't exist yet. Forces the student to wait
  // for AI generation (or retry it) before flipping to human review.
  const { data: feedback } = await supabase
    .from("feedback")
    .select(
      "total_score, score_strategy, score_execution, score_communication, score_technical, score_creativity, qualitative_feedback",
    )
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (!feedback) return { success: false, error: "no_feedback" };

  // Idempotency
  const { data: existing } = await supabase
    .from("regrade_requests")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (existing) return { success: false, error: "already_requested" };

  const { error: insertError } = await supabase
    .from("regrade_requests")
    .insert({
      submission_id: submissionId,
      user_id: user.id,
    });

  if (insertError) {
    console.error("[requestRegrade insert]", insertError);
    return { success: false, error: "insert_failed" };
  }

  // ─── Best-effort admin notification ──────────────────────────────
  // Fire-and-forget-ish: failures here don't fail the user-facing
  // action. The DB row is the canonical record.
  if (resend) {
    try {
      const { data: task } = await supabase
        .from("tasks")
        .select("title")
        .eq("id", submission.task_id)
        .maybeSingle();

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const submissionUrl = `${siteUrl}/submissions/${submissionId}`;

      const text = [
        `Student ${user.email} has requested a human regrade.`,
        ``,
        `Task: ${task?.title ?? "(unknown)"}`,
        `Submission: ${submission.submission_title}`,
        `Submitted: ${new Date(submission.created_at).toISOString()}`,
        ``,
        `Current AI grade: ${Math.round(feedback.total_score)}`,
        `  Strategy: ${feedback.score_strategy}`,
        `  Execution: ${feedback.score_execution}`,
        `  Communication: ${feedback.score_communication}`,
        `  Technical: ${feedback.score_technical}`,
        `  Creativity: ${feedback.score_creativity}`,
        ``,
        `Review the submission:`,
        submissionUrl,
      ].join("\n");

      await resend.emails.send({
        from: RESEND_FROM,
        to: ADMIN_EMAIL,
        subject: `Regrade requested — ${task?.title ?? "submission"}`,
        text,
      });
    } catch (err) {
      console.error("[requestRegrade email]", err);
    }
  }

  return { success: true };
}
