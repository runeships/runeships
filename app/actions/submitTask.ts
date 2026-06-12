"use server";

import { createClient } from "@/lib/supabase-server";
import { COOLDOWN_MS } from "@/lib/format";
import type { SubmissionMode } from "@/lib/database.types";

const URL_RE = /^https?:\/\/.+/i;

export type SubmitTaskState =
  | { status: "idle" }
  | { status: "success"; submissionId: string }
  | {
      status: "error";
      message: string;
      reason?: "cooldown";
      nextAllowedAt?: string;
    };

/**
 * Server action: validate + persist a submission. Does NOT trigger AI
 * feedback — that lands in Prompt 4. Cooldown is enforced server-side
 * here too even though the page renders the cooldown notice instead of
 * the form when active; this is the load-bearing check.
 */
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

  // Resolve the task's submission_mode so we can validate the right shape.
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, submission_mode")
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
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[submitTask insert]", insertError);
    return {
      status: "error",
      message: "Something went wrong on our side. Try again in a moment.",
    };
  }

  return { status: "success", submissionId: inserted.id };
}
