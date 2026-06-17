/**
 * Single-shot Claude call that scans a task brief for language that
 * might filter on protected demographics or signal bias. Returns
 * { flagged: boolean, note: string | null }. The note explains what
 * the model flagged so an admin reviewing the task knows what to
 * look at — never displayed to the company that posted the task.
 *
 * Best-effort: any failure returns { flagged: false, note: null } so
 * the task posting flow doesn't get blocked by a moderation outage.
 */

import { anthropic, DEFAULT_MODEL } from "@/lib/anthropic";

export type BiasCheckResult = {
  flagged: boolean;
  note: string | null;
};

export async function checkTaskBriefForBias(
  title: string,
  brief: string,
): Promise<BiasCheckResult> {
  const trimmedBrief = brief.trim();
  if (!trimmedBrief) return { flagged: false, note: null };
  // Cap input to keep this check cheap regardless of how long the
  // brief is — moderation only needs the first ~3k chars to spot
  // most issues.
  const briefSample = trimmedBrief.slice(0, 3000);

  const prompt = `You are reviewing a company-posted task brief on a student skill assessment platform for language that could:

- Filter on protected demographics (race, gender, religion, age, nationality, disability, sexual orientation)
- Reward specific cultural references that proxy for demographic groups
- Implicitly assume specific socioeconomic backgrounds (private school, family wealth, specific networks)
- Use language that could chill applicants from underrepresented groups
- Contain illegal or unethical task instructions (e.g. asking students to perform real unpaid commercial work without disclosure)

Do NOT flag for: technical jargon, mention of specific industries, mention of named companies as case studies, mention of named tools or frameworks, normal evaluation criteria (strategy, communication, etc.), requirement to be a current student, or other lawful job-relevant constraints.

TASK TITLE: ${title}

TASK BRIEF:
${briefSample}

OUTPUT FORMAT — respond with ONLY this JSON object, no other text, no markdown fences:

{
  "flagged": <true if you found concerning language, false otherwise>,
  "note": "<if flagged, one sentence describing what you flagged for an admin reviewer. Empty string if not flagged.>"
}`;

  try {
    // 6-second ceiling on the Anthropic call. If the API is slow,
    // we'd rather skip the check than hang the task-posting flow
    // long enough to trip the route's maxDuration and break the
    // post-redirect render.
    const response = await anthropic.messages.create(
      {
        model: DEFAULT_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: AbortSignal.timeout(6_000) },
    );
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
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.flagged === "boolean"
    ) {
      const note =
        typeof parsed.note === "string" && parsed.note.trim().length > 0
          ? parsed.note.trim().slice(0, 500)
          : null;
      return { flagged: parsed.flagged, note: parsed.flagged ? note : null };
    }
  } catch (err) {
    console.error("[biasCheck]", err);
  }
  return { flagged: false, note: null };
}
