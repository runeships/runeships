"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";
import { notifyStudentOfFeedback } from "@/lib/emails";

// Note: `maxDuration` cannot be exported from a "use server" file —
// it's a Route Segment Config and must live on the page/route that
// invokes this action. Set on /submissions/[id] and on
// /tasks/[companySlug]/[taskSlug] so both invocation paths have the
// 60-second function timeout this generation needs.

export type GenerateFeedbackResult =
  | { success: true; feedbackId: string; reused: boolean }
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
      "title, brief, submission_mode, estimated_time, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
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

  // ─── Build prompt + call Anthropic ────────────────────────────────
  const prompt = buildPrompt({
    submissionTitle: submission.submission_title,
    submissionBody: submission.submission_body,
    supportingLink: submission.supporting_link,
    taskBrief: task.brief,
    submissionMode: task.submission_mode,
    estimatedTime: task.estimated_time,
    companyName: company?.name ?? "Unknown",
  });

  let modelUsed = "claude-haiku-4-5-20251001";
  let rawText = "";

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    modelUsed = response.model || modelUsed;
    rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("");
  } catch (err) {
    console.error("[generateFeedback anthropic]", err);
    return { success: false, error: "api_failed" };
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
};

function buildPrompt(ctx: PromptCtx): string {
  const bodySection = ctx.submissionBody
    ? `Body:\n${ctx.submissionBody}\n\n`
    : "";
  const linkSection = ctx.supportingLink
    ? `Supporting link: ${ctx.supportingLink}\n(Note: you cannot fetch this link's contents — evaluate only what's described in the title/body and the link's apparent type from its URL.)\n\n`
    : "";

  return `You are evaluating a student's submission for an early-career skill assessment platform called RuneShips. Be direct and useful. No corporate softening. This feedback is meant to genuinely help the student improve.

TASK BRIEF:
${ctx.taskBrief}

Submission mode: ${ctx.submissionMode}
Estimated time: ${ctx.estimatedTime ?? "unspecified"}
Posted by: ${ctx.companyName}

STUDENT'S SUBMISSION:
Title: ${ctx.submissionTitle}
${bodySection}${linkSection}SCORE the submission on these five dimensions, each 0-100:

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
- For link-only or text+link submissions where you can't see the linked artifact: acknowledge what you could and couldn't evaluate, score conservatively, focus feedback on what they did describe.

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
