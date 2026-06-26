"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";
import { getRankings } from "@/lib/rankings";
import {
  generateResumeCode,
  isInCvBuildCooldown,
  nextCvBuildAvailableAt,
} from "@/lib/resumeCode";

export type BuildCvBulletState =
  | { status: "idle" }
  | {
      status: "success";
      block: string;
      resumeCode: string;
    }
  | {
      status: "error";
      message: string;
      reason?: "no_auth" | "seed" | "no_tasks" | "cooldown" | "internal";
      nextAvailableAt?: string;
    };

/** Build a multi-line CV block from a set of user-selected tasks.
 *
 *  Output shape:
 *    RuneShips — Ranked in the top X% of N students... Verified at
 *    runeships.com/v/{code}
 *
 *    Selected work:
 *    1. {Task title} — {1-2 sentence CV-friendly summary}
 *    2. ...
 *
 *  Per-task summaries are cached on tasks.cv_summary (one row per
 *  task, shared across all students who include it). The cache fills
 *  lazily — first build to include a task pays the AI cost, every
 *  later build reads the stored text for free. */
export async function buildCvBullet(
  taskIds: string[],
): Promise<BuildCvBulletState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "Sign in to build a CV block.",
      reason: "no_auth",
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, is_seed, resume_code, last_resume_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return {
      status: "error",
      message: "Profile not found. Finish onboarding first.",
      reason: "no_auth",
    };
  }
  if (profile.is_seed) {
    return {
      status: "error",
      message: "Demo accounts can't build CV blocks.",
      reason: "seed",
    };
  }

  // Daily cooldown — gates the (potential) Anthropic call for
  // uncached task summaries. Cheap when cache hits, but the call
  // itself is real money on miss.
  if (isInCvBuildCooldown(profile.last_resume_at)) {
    return {
      status: "error",
      message: "You can only regenerate your CV block once per day.",
      reason: "cooldown",
      nextAvailableAt: nextCvBuildAvailableAt(profile.last_resume_at!),
    };
  }

  // Ensure the verification code exists.
  let resumeCode = profile.resume_code;
  if (!resumeCode) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateResumeCode();
      const { error } = await admin
        .from("profiles")
        .update({ resume_code: candidate })
        .eq("id", profile.id)
        .is("resume_code", null);
      if (!error) {
        resumeCode = candidate;
        break;
      }
    }
    if (!resumeCode) {
      return {
        status: "error",
        message: "Couldn't assign a verification code. Try again.",
        reason: "internal",
      };
    }
  }

  // Verify the user actually completed each selected task (has a
  // submission with feedback). Filters out spoofed IDs cleanly.
  const cleanIds = Array.from(new Set(taskIds.filter(Boolean))).slice(0, 12);
  if (cleanIds.length === 0) {
    // Allowed — they'll get just the intro line with no task list.
  }
  let verifiedTaskIds: string[] = [];
  if (cleanIds.length > 0) {
    const { data: subs } = await admin
      .from("submissions")
      .select("id, task_id")
      .eq("user_id", user.id)
      .in("task_id", cleanIds);
    const subIds = (subs ?? []).map((s) => s.id);
    if (subIds.length > 0) {
      const { data: fbRows } = await admin
        .from("feedback")
        .select("submission_id")
        .in("submission_id", subIds);
      const fbSet = new Set((fbRows ?? []).map((f) => f.submission_id));
      const taskIdsWithFeedback = new Set(
        (subs ?? []).filter((s) => fbSet.has(s.id)).map((s) => s.task_id),
      );
      verifiedTaskIds = cleanIds.filter((id) => taskIdsWithFeedback.has(id));
    }
  }

  // Load the verified tasks + their cv_summary cache + their company.
  type TaskRow = {
    id: string;
    title: string;
    brief: string;
    category: string;
    cv_summary: string | null;
    company_id: string;
  };
  let tasks: TaskRow[] = [];
  if (verifiedTaskIds.length > 0) {
    const { data: taskRows } = await admin
      .from("tasks")
      .select("id, title, brief, category, cv_summary, company_id")
      .in("id", verifiedTaskIds);
    tasks = (taskRows ?? []) as TaskRow[];
  }

  // Populate missing cv_summary via Anthropic. Single batched call
  // covers every uncached task in this build.
  const needSummary = tasks.filter((t) => !t.cv_summary?.trim());
  if (needSummary.length > 0) {
    try {
      const summaries = await summarizeTasks(needSummary);
      // Persist each one. Best-effort — if a single write fails, the
      // in-memory map still has the summary so the output still works.
      await Promise.all(
        Object.entries(summaries).map(([id, summary]) =>
          admin.from("tasks").update({ cv_summary: summary }).eq("id", id),
        ),
      );
      // Merge back into our local tasks list.
      tasks = tasks.map((t) =>
        summaries[t.id] ? { ...t, cv_summary: summaries[t.id] } : t,
      );
    } catch (err) {
      console.error("[buildCvBullet summarize]", err);
      // Soft-fall to task title as the summary.
      tasks = tasks.map((t) =>
        t.cv_summary ? t : { ...t, cv_summary: t.title }
      );
    }
  }

  const rankings = await getRankings(user.id);
  const block = renderBlock({
    rankings,
    tasks,
    resumeCode,
  });

  // Stamp last_resume_at so the daily cooldown engages. Best-effort —
  // the user gets the block either way.
  try {
    await admin
      .from("profiles")
      .update({ last_resume_at: new Date().toISOString() })
      .eq("id", profile.id);
  } catch (err) {
    console.error("[buildCvBullet stamp]", err);
  }

  return {
    status: "success",
    block,
    resumeCode,
  };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

type SummarizeInput = {
  id: string;
  title: string;
  brief: string;
  category: string;
};

/** Returns { [task_id]: summary }. */
async function summarizeTasks(
  tasks: SummarizeInput[],
): Promise<Record<string, string>> {
  const prompt = buildSummarizePrompt(tasks);
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }],
  });
  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected array");
  const out: Record<string, string> = {};
  for (const item of parsed) {
    if (
      item &&
      typeof item === "object" &&
      typeof item.task_id === "string" &&
      typeof item.summary === "string" &&
      item.summary.trim().length > 0
    ) {
      out[item.task_id] = item.summary.trim();
    }
  }
  return out;
}

function buildSummarizePrompt(tasks: SummarizeInput[]): string {
  const block = tasks
    .map(
      (t) =>
        `TASK ID: ${t.id}\nTITLE: ${t.title}\nCATEGORY: ${t.category}\nBRIEF:\n${(t.brief || "(no brief)").slice(0, 1500)}\n`,
    )
    .join("\n---\n\n");
  return `You are writing CV bullet descriptions for a student who completed these RuneShips tasks. For EACH task, write ONE concise sentence (max ~25 words) describing what the work involved, suitable for a CV bullet point. Past-tense, active voice, concrete. Do not invent results, metrics, or technologies that aren't in the brief. Do not flatter or use corporate language.

${block}

OUTPUT FORMAT — respond with ONLY a JSON array, no other text, no markdown fences:

[
  { "task_id": "<the id>", "summary": "<one sentence describing the work>" },
  ...
]`;
}

function renderBlock(ctx: {
  rankings: Awaited<ReturnType<typeof getRankings>>;
  tasks: Array<{ title: string; cv_summary: string | null }>;
  resumeCode: string;
}): string {
  // No trailing period after URLs — keeps email/Slack/LinkedIn link
  // parsers from sweeping the . into the href.
  const verifyUrl = `runeships.com/v/${ctx.resumeCode}`;
  const introLine =
    ctx.rankings.overallPercentile !== null &&
    ctx.rankings.cohortSize > 0
      ? `RuneShips · Ranked in the top ${Math.max(1, 100 - ctx.rankings.overallPercentile)}% of ${ctx.rankings.cohortSize.toLocaleString()} students on a skill assessment platform evaluating real business tasks across strategy, execution, communication, technical, and creativity (${verifyUrl})`
      : `RuneShips · Active on a skill assessment platform evaluating real business tasks across strategy, execution, communication, technical, and creativity (${verifyUrl})`;

  if (ctx.tasks.length === 0) {
    return introLine;
  }

  const taskLines = ctx.tasks
    .map((t, i) => {
      const summary = (t.cv_summary ?? "").trim() || t.title;
      return `${i + 1}. ${t.title}: ${summary}`;
    })
    .join("\n");

  return `${introLine}\n\nSelected work:\n${taskLines}`;
}
