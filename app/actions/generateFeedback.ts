"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";
import { notifyStudentOfFeedback } from "@/lib/emails";
import { parseGithubUrl, fetchRepoForPrompt } from "@/lib/githubFetch";
import {
  parseGoogleDocsUrl,
  fetchGoogleDocForPrompt,
} from "@/lib/googleDocsFetch";

// Output budget for the Anthropic call. Used both to size the
// max_tokens request and to estimate cost before we start.
const OUTPUT_TOKEN_BUDGET = 1500;
// Rough char→token ratio for English + code. Conservative enough
// for budget gating without being so generous it lets the budget
// silently slip past.
const CHARS_PER_TOKEN = 3.5;

// Note: `maxDuration` cannot be exported from a "use server" file —
// it's a Route Segment Config and must live on the page/route that
// invokes this action. Set on /submissions/[id] and on
// /tasks/[companySlug]/[taskSlug] so both invocation paths have the
// 60-second function timeout this generation needs.

export type GenerateFeedbackResult =
  | { success: true; feedbackId: string; reused: boolean }
  | { success: false; error: "budget_exhausted" }
  | {
      success: false;
      error:
        | "unauthorized"
        | "submission_not_found"
        | "task_not_found"
        | "parse_failed"
        | "api_failed"
        | "insert_failed";
    };

/**
 * Generates per-dimension scores + qualitative feedback for a
 * submission. Idempotent: if a feedback row already exists for the
 * submission, returns success without re-charging Anthropic.
 *
 * Reads: server client (RLS-bound to the user) for ownership + lookups.
 * Writes: admin client (service role) for the feedback INSERT — the
 * feedback table has no INSERT policy for authenticated, only
 * service_role.
 */
export async function generateFeedback(
  submissionId: string,
): Promise<GenerateFeedbackResult> {
  const supabase = await createClient();

  // ─── Auth ─────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthorized" };

  // ─── Load submission (RLS restricts to the caller's own) ──────────
  const { data: submission, error: subErr } = await supabase
    .from("submissions")
    .select(
      "id, submission_title, submission_body, supporting_link, task_id, user_id",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (subErr || !submission || submission.user_id !== user.id) {
    if (subErr) console.error("[generateFeedback submission]", subErr);
    return { success: false, error: "submission_not_found" };
  }

  // ─── Idempotency: skip if feedback already exists ─────────────────
  const { data: existing } = await supabase
    .from("feedback")
    .select("id")
    .eq("submission_id", submission.id)
    .maybeSingle();

  if (existing) {
    return { success: true, feedbackId: existing.id, reused: true };
  }

  // ─── Load the task + company for the prompt context ───────────────
  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .select(
      "id, title, brief, submission_mode, estimated_time, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity, ai_token_budget, ai_tokens_used",
    )
    .eq("id", submission.task_id)
    .maybeSingle();

  if (taskErr || !task) {
    if (taskErr) console.error("[generateFeedback task]", taskErr);
    return { success: false, error: "task_not_found" };
  }

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", task.company_id)
    .maybeSingle();

  // ─── Optional external doc fetch ─────────────────────────────────
  // GitHub: pull README + tree + key files (~50k char cap).
  // Google Docs / Sheets / Slides: export as text/CSV via the
  // public export endpoint (~30k char cap). Private docs return
  // attemptedButPrivate=true so the prompt knows to soften.
  let externalDocBlock: string | null = null;
  let externalDocKind: "github" | "google_docs" | null = null;
  let attemptedButInaccessible = false;
  if (submission.supporting_link) {
    const gh = parseGithubUrl(submission.supporting_link);
    if (gh) {
      const res = await fetchRepoForPrompt(gh);
      if (res.ok && res.charCount > 0) {
        externalDocBlock = res.formatted;
        externalDocKind = "github";
      } else {
        attemptedButInaccessible = true;
      }
    } else {
      const gd = parseGoogleDocsUrl(submission.supporting_link);
      if (gd) {
        const res = await fetchGoogleDocForPrompt(gd);
        if (res.ok && res.charCount > 0) {
          externalDocBlock = res.formatted;
          externalDocKind = "google_docs";
        } else if (res.attemptedButPrivate) {
          attemptedButInaccessible = true;
        }
      }
    }
  }

  // ─── Build prompt ─────────────────────────────────────────────────
  const prompt = buildPrompt({
    submissionTitle: submission.submission_title,
    submissionBody: submission.submission_body,
    supportingLink: submission.supporting_link,
    taskBrief: task.brief,
    submissionMode: task.submission_mode,
    estimatedTime: task.estimated_time,
    companyName: company?.name ?? "Unknown",
    externalDocBlock,
    externalDocKind,
    attemptedButInaccessible,
  });

  // ─── Token budget gate ───────────────────────────────────────────
  // Estimate this run's cost (input chars / ~3.5 + output buffer).
  // If used + estimate > budget, skip the AI call entirely and let
  // the submission fall through to admin manual review.
  const estimatedInputTokens = Math.ceil(prompt.length / CHARS_PER_TOKEN);
  const estimatedCallCost = estimatedInputTokens + OUTPUT_TOKEN_BUDGET;
  if (task.ai_tokens_used + estimatedCallCost > task.ai_token_budget) {
    console.warn("[generateFeedback budget_exhausted]", {
      taskId: task.id,
      used: task.ai_tokens_used,
      budget: task.ai_token_budget,
      estimatedCallCost,
    });
    return { success: false, error: "budget_exhausted" };
  }

  // ─── Anthropic call ───────────────────────────────────────────────
  let modelUsed = "claude-haiku-4-5-20251001";
  let rawText = "";
  let actualInputTokens = estimatedInputTokens;
  let actualOutputTokens = OUTPUT_TOKEN_BUDGET;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: OUTPUT_TOKEN_BUDGET,
      messages: [{ role: "user", content: prompt }],
    });
    modelUsed = response.model || modelUsed;
    rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
    if (response.usage) {
      actualInputTokens = response.usage.input_tokens;
      actualOutputTokens = response.usage.output_tokens;
    }
  } catch (err) {
    console.error("[generateFeedback anthropic]", err);
    return { success: false, error: "api_failed" };
  }

  // Best-effort: bump task token usage so the budget gate stays
  // accurate for the next submission. Failure here doesn't block
  // delivery of the feedback row we already have.
  try {
    const adminUsageClient = createAdminClient();
    await adminUsageClient
      .from("tasks")
      .update({
        ai_tokens_used:
          task.ai_tokens_used + actualInputTokens + actualOutputTokens,
      })
      .eq("id", task.id);
  } catch (err) {
    console.error("[generateFeedback budget update]", err);
  }

  // ─── Parse JSON (strip fences if present, then JSON.parse) ────────
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("[generateFeedback parse]", err, { raw: rawText });
    return { success: false, error: "parse_failed" };
  }

  const validated = validatePayload(parsed);
  if (!validated) {
    console.error("[generateFeedback validate]", { parsed, raw: rawText });
    return { success: false, error: "parse_failed" };
  }

  // ─── Compute weighted total ───────────────────────────────────────
  const totalRaw =
    validated.score_strategy * task.weight_strategy +
    validated.score_execution * task.weight_execution +
    validated.score_communication * task.weight_communication +
    validated.score_technical * task.weight_technical +
    validated.score_creativity * task.weight_creativity;
  const totalScore = Math.round(totalRaw * 10) / 10;

  // ─── Insert via service-role client ───────────────────────────────
  const admin = createAdminClient();
  const { data: inserted, error: insertError } = await admin
    .from("feedback")
    .insert({
      submission_id: submission.id,
      score_strategy: validated.score_strategy,
      score_execution: validated.score_execution,
      score_communication: validated.score_communication,
      score_technical: validated.score_technical,
      score_creativity: validated.score_creativity,
      total_score: totalScore,
      qualitative_feedback: validated.qualitative_feedback,
      model_used: modelUsed,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[generateFeedback insert]", insertError);
    return { success: false, error: "insert_failed" };
  }

  // Best-effort email notification. Email failure must not block
  // feedback delivery — the DB row is the source of truth.
  try {
    const { data: studentProfile } = await admin
      .from("profiles")
      .select("email, full_name, notify_on_feedback")
      .eq("id", submission.user_id)
      .maybeSingle();
    if (studentProfile) {
      await notifyStudentOfFeedback({
        submissionId: submission.id,
        studentEmail: studentProfile.email,
        studentName: studentProfile.full_name,
        taskTitle: task.title ?? "(untitled task)",
        totalScore,
        notifyOnFeedback: studentProfile.notify_on_feedback,
        source: "ai",
      });
    }
  } catch (err) {
    console.error("[generateFeedback notify]", err);
  }

  return { success: true, feedbackId: inserted.id, reused: false };
}

/* ─── Helpers ──────────────────────────────────────────────────────── */

type PromptCtx = {
  submissionTitle: string;
  submissionBody: string | null;
  supportingLink: string | null;
  taskBrief: string;
  submissionMode: string;
  estimatedTime: string | null;
  companyName: string;
  externalDocBlock: string | null;
  externalDocKind: "github" | "google_docs" | null;
  attemptedButInaccessible: boolean;
};

function buildPrompt(ctx: PromptCtx): string {
  const bodySection = ctx.submissionBody
    ? `Body:\n${ctx.submissionBody}\n\n`
    : "";

  let linkSection = "";
  if (ctx.supportingLink) {
    if (ctx.externalDocBlock) {
      const kindLabel =
        ctx.externalDocKind === "github"
          ? "repo"
          : "linked document";
      linkSection = `Supporting link: ${ctx.supportingLink}\n(We fetched this ${kindLabel} for you — its contents are included below.)\n\n`;
    } else if (ctx.attemptedButInaccessible) {
      linkSection = `Supporting link: ${ctx.supportingLink}\n(We tried to fetch this link's contents but it is not publicly accessible — the student likely shared it with restricted permissions. This is a tooling limitation, NOT the student's fault. The student followed the submission format correctly by providing a link; they may simply not have realized the share settings needed to be open.)\n\n`;
    } else {
      linkSection = `Supporting link: ${ctx.supportingLink}\n(We don't have a fetcher for this link type. Evaluate based on the title/body and any context you can infer.)\n\n`;
    }
  }

  const externalSection = ctx.externalDocBlock
    ? `\nFETCHED LINK CONTENTS (auto-pulled from the supporting link):\n\n${ctx.externalDocBlock}\n\n`
    : "";

  return `You are evaluating a student's submission for an early-career skill assessment platform called RuneShips. Be direct and useful. No corporate softening. This feedback is meant to genuinely help the student improve.

TASK BRIEF:
${ctx.taskBrief}

Submission mode: ${ctx.submissionMode}
Estimated time: ${ctx.estimatedTime ?? "unspecified"}
Posted by: ${ctx.companyName}

STUDENT'S SUBMISSION:
Title: ${ctx.submissionTitle}
${bodySection}${linkSection}${externalSection}SCORE the submission on these five dimensions, each 0-100:

1. Strategy — analytical thinking, problem framing, decision logic
2. Execution — quality, completeness, attention to detail
3. Communication — clarity, structure, writing, presentation
4. Technical — appropriate use of tools, code, data, calculations
5. Creativity — original insight, novel framing, differentiated thinking

Apply scoring rigor: 50 is average submission, 70 is strong, 85+ is exceptional. Reserve 90+ for genuinely outstanding work. Don't inflate.

QUALITATIVE FEEDBACK (200-400 words) must cover:
- One specific strength they demonstrated (with evidence from their submission)
- One specific area for improvement (with concrete advice they can act on next time)
- Whether their reasoning was sound or if you spotted holes/gaps

IMPORTANT — handling link accessibility:
- If we couldn't fetch the linked content (private doc, restricted share settings): DO NOT penalize the student for using a link, and DO NOT lecture them about submission format. Submitting a link IS a valid choice if the task accepts it. The inability to fetch is a platform limitation, not their failure. In this case: explicitly note in the feedback that we couldn't access the linked content, mention they should double-check sharing permissions next time, then evaluate fairly on whatever IS available (title, body, link type signals). Score charitably — assume the linked work is competent unless the title/body suggests otherwise. Lean toward middle-of-range scores (45-65) by default rather than dragging them down.
- If the brief explicitly requires plain text and the student linked a doc anyway: note the format mismatch as a small execution gap (lose a few points on Execution), but don't make it the centerpiece of the feedback. Most of the qualitative feedback should still be about the actual work.
- If we DID fetch the linked content: evaluate it directly. The fetched content is authoritative — judge the actual work, not the format.

FORMATTING — your qualitative_feedback string is rendered as markdown. You may use light formatting: **bold** for emphasis on key terms or concepts, bullet lists (using - dashes) for multi-point recommendations, and blank lines between paragraphs. Don't overdo it — most of the feedback should be flowing prose. Reserve bold for 2–3 truly important phrases, and only use bullets when listing 3+ discrete points. Headings (# / ##) are unnecessary at this length; just use paragraphs.

OUTPUT FORMAT — respond with ONLY this JSON object, no other text, no markdown fences:

{
  "score_strategy": <integer 0-100>,
  "score_execution": <integer 0-100>,
  "score_communication": <integer 0-100>,
  "score_technical": <integer 0-100>,
  "score_creativity": <integer 0-100>,
  "qualitative_feedback": "<your 200-400 word feedback as a single string with proper line breaks using \\n\\n between paragraphs>"
}`;
}

type ValidatedPayload = {
  score_strategy: number;
  score_execution: number;
  score_communication: number;
  score_technical: number;
  score_creativity: number;
  qualitative_feedback: string;
};

function validatePayload(input: unknown): ValidatedPayload | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;

  const strategy = validateScore(obj.score_strategy);
  const execution = validateScore(obj.score_execution);
  const communication = validateScore(obj.score_communication);
  const technical = validateScore(obj.score_technical);
  const creativity = validateScore(obj.score_creativity);

  const feedbackText =
    typeof obj.qualitative_feedback === "string" &&
    obj.qualitative_feedback.trim().length > 0
      ? obj.qualitative_feedback
      : null;

  if (
    strategy === null ||
    execution === null ||
    communication === null ||
    technical === null ||
    creativity === null ||
    feedbackText === null
  ) {
    return null;
  }

  return {
    score_strategy: strategy,
    score_execution: execution,
    score_communication: communication,
    score_technical: technical,
    score_creativity: creativity,
    qualitative_feedback: feedbackText,
  };
}

function validateScore(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const rounded = Math.round(v);
  if (rounded < 0 || rounded > 100) return null;
  return rounded;
}
