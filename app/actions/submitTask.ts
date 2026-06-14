"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { COOLDOWN_MS } from "@/lib/format";
import { generateFeedback } from "./generateFeedback";
import { notifyAdminOfNewSubmission } from "@/lib/emails";
import type { SubmissionMode } from "@/lib/database.types";

// Note: `maxDuration` cannot live in a "use server" file. The 60s
// timeout for the submit + generate chain is set on the page that
// invokes this action — /tasks/[companySlug]/[taskSlug]/page.tsx.

const URL_RE = /^https?:\/\/.+/i;

// Length caps to keep abuse cheap on our end and submissions
// reasonable. Body cap of 30k chars ≈ 7.5k tokens — generous for
// thoughtful work, blocks pasting an entire book to chew through
// the AI budget.
const MAX_TITLE_CHARS = 200;
// 12,000 chars ≈ 2,000 words ≈ 3,000 tokens. Accommodates legitimate
// essay-format briefs (strategy memos, financial reasoning, design
// rationale) while still bounding what one submission can consume.
// Anything bigger than this realistically belongs in a hosted doc;
// the linked-content fetchers (Google Docs at 40k chars, GitHub at
// 60k) handle the long-form case with their own caps.
const MAX_BODY_CHARS = 12_000;
const MAX_LINK_CHARS = 2_000;

// Global per-user daily cap. Per-task 24h cooldown stops re-submits
// to one task; this stops a single user from churning through every
// task in a day. Tasks max ~7-10; 5/day = engaged but not farming.
const DAILY_SUBMISSION_CAP = 5;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

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
  if (submissionTitle.length > MAX_TITLE_CHARS) {
    return {
      status: "error",
      message: `Title is too long — keep it under ${MAX_TITLE_CHARS} characters.`,
    };
  }
  if (needsText && !submissionBody) {
    return {
      status: "error",
      message: "Please add your written work in the body field.",
    };
  }
  if (submissionBody.length > MAX_BODY_CHARS) {
    return {
      status: "error",
      message: `Your submission is too long — keep it under ${MAX_BODY_CHARS.toLocaleString()} characters (about 1,200 words). If your work is longer, link to it instead (Google Doc, GitHub repo, hosted page).`,
    };
  }
  if (needsLink) {
    if (!supportingLink) {
      return {
        status: "error",
        message: "Please add a supporting link.",
      };
    }
    if (supportingLink.length > MAX_LINK_CHARS) {
      return {
        status: "error",
        message: "That URL is unusually long. Try shortening it.",
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

  // ─── Global daily cap ───────────────────────────────────────────
  // Per-task cooldown blocks re-submits to one task. This blocks a
  // single user from blowing through every available task in a day.
  const windowStart = new Date(Date.now() - DAILY_WINDOW_MS).toISOString();
  const { count: recentCount } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", windowStart);
  if ((recentCount ?? 0) >= DAILY_SUBMISSION_CAP) {
    return {
      status: "error",
      message: `You've hit the ${DAILY_SUBMISSION_CAP}-submission daily limit. Come back tomorrow — quality over quantity beats grinding through every task in one sitting.`,
    };
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

  // AI feedback runs unless the task's per-task token budget is
  // exhausted (or the company picked 'human'-only at the task
  // level — though now both modes still run AI; 'human' just means
  // additional eyes-on). When budget is exhausted, AI is skipped
  // entirely and the submission falls through to admin review.
  const feedback = await generateFeedback(inserted.id);
  if (!feedback.success) {
    console.warn("[submitTask generateFeedback]", feedback.error);
  }
  const awaitingHumanReview =
    !feedback.success && feedback.error === "budget_exhausted";

  // Always notify admin — every submission goes through admin
  // release gating before the company sees it. Best-effort.
  try {
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
  } catch (err) {
    console.error("[submitTask notify admin]", err);
  }

  // Companies are NOT notified at submission time anymore. Admin
  // releases each submission individually from /admin/submissions,
  // and the release action fires the company email.

  return {
    status: "success",
    submissionId: inserted.id,
    feedbackGenerated: feedback.success,
    awaitingHumanReview,
    companyName,
  };
}
