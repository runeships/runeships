"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { COOLDOWN_MS } from "@/lib/format";
import { generateFeedback } from "./generateFeedback";
import {
  notifyAdminOfNewSubmission,
  notifyCompanyOfNewSubmission,
} from "@/lib/emails";
import type { SubmissionMode } from "@/lib/database.types";

// Note: `maxDuration` cannot live in a "use server" file. The 60s
// timeout for the submit + generate chain is set on the page that
// invokes this action — /tasks/[companySlug]/[taskSlug]/page.tsx.

const URL_RE = /^https?:\/\/.+/i;

export type SubmitTaskState =
  | { status: "idle" }
  | {
      status: "success";
      submissionId: string;
      feedbackGenerated: boolean;
      awaitingHumanReview: boolean;
      companyName: string | null;
    }
  | {
      status: "error";
      message: string;
      reason?: "cooldown";
      nextAllowedAt?: string;
    };

export async function submitTask(
  _prev: SubmitTaskState,
  formData: FormData,
): Promise<SubmitTaskState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      status: "error",
      message: "Your session expired. Sign in again to continue.",
    };
  }

  const taskId = String(formData.get("task_id") ?? "").trim();
  if (!taskId) {
    return { status: "error", message: "Missing task. Refresh and try again." };
  }

  const submissionTitle = String(formData.get("submission_title") ?? "").trim();
  const submissionBody = String(formData.get("submission_body") ?? "").trim();
  const supportingLink = String(formData.get("supporting_link") ?? "").trim();
  const linkAccessConfirmed =
    formData.get("link_access_confirmed") === "on" ||
    formData.get("link_access_confirmed") === "true";

  // Load both the submission shape AND the evaluation_mode + company
  // info needed for the post-insert routing (AI feedback vs human
  // review notification email).
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, title, submission_mode, evaluation_mode, company_id")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError || !task) {
    console.error("[submitTask task lookup]", taskError);
    return {
      status: "error",
      message: "We couldn’t find that task. Try refreshing.",
    };
  }

  const mode: SubmissionMode = task.submission_mode;
  const needsText = mode === "text_only" || mode === "text_and_link";
  const needsLink = mode === "link_only" || mode === "text_and_link";

  // ─── Validation ─────────────────────────────────────────────────
  if (!submissionTitle) {
    return {
      status: "error",
      message: "Please add a title for your submission.",
    };
  }
  if (needsText && !submissionBody) {
    return {
      status: "error",
      message: "Please add your written work in the body field.",
    };
  }
  if (needsLink) {
    if (!supportingLink) {
      return {
        status: "error",
        message: "Please add a supporting link.",
      };
    }
    if (!URL_RE.test(supportingLink)) {
      return {
        status: "error",
        message:
          "Supporting link must start with http:// or https://",
      };
    }
    if (!linkAccessConfirmed) {
      return {
        status: "error",
        message:
          "Please confirm the link is viewable by anyone with the link.",
      };
    }
  }

  // ─── Cooldown ───────────────────────────────────────────────────
  const { data: lastSub } = await supabase
    .from("submissions")
    .select("created_at")
    .eq("user_id", user.id)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastSub) {
    const lastTime = new Date(lastSub.created_at).getTime();
    const elapsed = Date.now() - lastTime;
    if (elapsed < COOLDOWN_MS) {
      const nextAllowedAt = new Date(lastTime + COOLDOWN_MS).toISOString();
      return {
        status: "error",
        reason: "cooldown",
        nextAllowedAt,
        message:
          "You can submit again once the 24-hour cooldown lifts.",
      };
    }
  }

  // ─── Insert ─────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from("submissions")
    .insert({
      user_id: user.id,
      task_id: taskId,
      submission_title: submissionTitle,
      submission_body: needsText ? submissionBody : null,
      supporting_link: needsLink ? supportingLink : null,
      link_access_confirmed: needsLink ? linkAccessConfirmed : false,
    })
    .select("id, created_at")
    .single();

  if (insertError || !inserted) {
    console.error("[submitTask insert]", insertError);
    return {
      status: "error",
      message: "Something went wrong on our side. Try again in a moment.",
    };
  }

  // Look up company name for the success-state copy and the admin
  // notification email. Service-role bypasses RLS so we get the
  // record regardless of policy.
  const admin = createAdminClient();
  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", task.company_id)
    .maybeSingle();
  const companyName = company?.name ?? null;

  // ─── Branch on evaluation_mode ─────────────────────────────────
  if (task.evaluation_mode === "human") {
    // No AI run. Notify admins and return a state the form can
    // render as "your work is in the queue."
    const { data: studentProfile } = await admin
      .from("profiles")
      .select("full_name, school, graduation_year")
      .eq("id", user.id)
      .maybeSingle();

    await notifyAdminOfNewSubmission({
      submissionId: inserted.id,
      taskTitle: task.title,
      companyName: companyName ?? "(unknown)",
      studentName: studentProfile?.full_name ?? user.email ?? "(unnamed)",
      studentSchool: studentProfile?.school ?? null,
      studentGradYear: studentProfile?.graduation_year ?? null,
      submittedAt: inserted.created_at,
    });

    return {
      status: "success",
      submissionId: inserted.id,
      feedbackGenerated: false,
      awaitingHumanReview: true,
      companyName,
    };
  }

  // AI path — existing flow.
  const feedback = await generateFeedback(inserted.id);
  if (!feedback.success) {
    console.error("[submitTask generateFeedback]", feedback.error);
  }

  // Notify the task's owning company if they opted in. Best-effort —
  // failure must not block the student's submission flow.
  try {
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("email, notify_on_new_submission")
      .eq("company_id", task.company_id)
      .eq("account_type", "company")
      .maybeSingle();
    if (ownerProfile?.notify_on_new_submission && ownerProfile.email) {
      const { data: studentProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      const { data: totalScoreRow } = await admin
        .from("feedback")
        .select("total_score")
        .eq("submission_id", inserted.id)
        .maybeSingle();
      await notifyCompanyOfNewSubmission({
        recipientEmail: ownerProfile.email,
        studentName: studentProfile?.full_name ?? user.email ?? "(unnamed)",
        taskTitle: task.title,
        taskId: task.id,
        totalScore: totalScoreRow?.total_score ?? null,
      });
    }
  } catch (err) {
    console.error("[submitTask notify company]", err);
  }

  return {
    status: "success",
    submissionId: inserted.id,
    feedbackGenerated: feedback.success,
    awaitingHumanReview: false,
    companyName,
  };
}
