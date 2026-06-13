"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin";
import { notifyStudentOfNewTask } from "@/lib/emails";

// NOTE: At ~3000 active users + ~4 tasks/month, this approaches the
// Resend free tier monthly limit (3,000/month). At scale, batch
// sending via Resend's batch API or upgrade the plan.
//
// TODO: When an admin task-creation UI exists, the create action
// should invoke notifyNewTask automatically as part of the publish
// flow so admins don't have to remember to click 'Notify cohort'
// manually.

export type NotifyNewTaskResult =
  | { success: true; sentCount: number; matchedCount: number }
  | { success: false; error: string };

const ALL_DIMENSIONS = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
] as const;
type Dimension = (typeof ALL_DIMENSIONS)[number];

const PRIMARY_WEIGHT_THRESHOLD = 0.2;

/**
 * Send a "new task" email to every real (non-seed), opted-in
 * student whose declared career_tracks overlap with the task's
 * primary dimensions (weight >= 0.20). The 'Other' track and
 * empty career_tracks both count as wildcards — those students
 * always receive.
 *
 * Returns { success, sentCount, matchedCount } so the admin UI
 * can show "Sent to N of M matching students" after dispatch.
 *
 * Admin-only. Uses requireAdmin() at the top — env-admin or DB
 * is_admin both pass.
 */
export async function notifyNewTask(
  taskId: string,
): Promise<NotifyNewTaskResult> {
  await requireAdmin();
  const admin = createAdminClient();

  // ─── Load the task + company ────────────────────────────────
  const { data: task, error: taskErr } = await admin
    .from("tasks")
    .select(
      "id, slug, title, brief, estimated_time, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
    )
    .eq("id", taskId)
    .maybeSingle();
  if (taskErr || !task) {
    console.error("[notifyNewTask task]", taskErr);
    return { success: false, error: "Task not found." };
  }

  const { data: company } = await admin
    .from("companies")
    .select("slug, name")
    .eq("id", task.company_id)
    .maybeSingle();
  if (!company) {
    return { success: false, error: "Company not found for task." };
  }

  // ─── Determine primary dimensions (weight >= 0.20) ──────────
  const primaryDimensions: Dimension[] = [];
  for (const d of ALL_DIMENSIONS) {
    const weightKey =
      `weight_${d}` as `weight_${typeof d}`;
    if ((task[weightKey] ?? 0) >= PRIMARY_WEIGHT_THRESHOLD) {
      primaryDimensions.push(d);
    }
  }
  const primaryCapitalized = primaryDimensions.map(
    (d) => d.charAt(0).toUpperCase() + d.slice(1),
  );
  const primarySet = new Set(primaryCapitalized);

  // ─── Query opted-in real students ───────────────────────────
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("id, email, full_name, career_tracks")
    .eq("leaderboard_visible", true)
    .eq("notify_on_new_tasks", true)
    .eq("is_seed", false);
  if (profilesErr) {
    console.error("[notifyNewTask profiles]", profilesErr);
    return { success: false, error: "Couldn't load student list." };
  }

  // ─── Match against career tracks ────────────────────────────
  // Empty/null career_tracks → match (default to send). 'Other'
  // → match (wildcard). Any track string overlapping with the
  // task's primary capitalized dimension names → match.
  const matching = (profiles ?? []).filter((p) => {
    const tracks = p.career_tracks ?? [];
    if (tracks.length === 0) return true;
    if (tracks.some((t: string) => t === "Other")) return true;
    return tracks.some((t: string) => primarySet.has(t));
  });

  // ─── Brief teaser (plain text, ~200 chars) ──────────────────
  const briefTeaser = plainTeaser(task.brief, 200);

  // ─── Fan out emails ─────────────────────────────────────────
  let sent = 0;
  for (const p of matching) {
    const result = await notifyStudentOfNewTask({
      recipientEmail: p.email,
      recipientName: p.full_name,
      taskTitle: task.title,
      taskSlug: task.slug,
      companyName: company.name,
      companySlug: company.slug,
      estimatedTime: task.estimated_time,
      primaryDimensions: primaryCapitalized,
      briefTeaser,
    });
    if (result.ok) sent++;
  }

  return {
    success: true,
    sentCount: sent,
    matchedCount: matching.length,
  };
}

/**
 * Reduce a markdown brief to a plain-text teaser. Drops # headings,
 * strips ** / * emphasis, collapses whitespace, and truncates to
 * `maxLen` chars on a word boundary with an ellipsis.
 */
function plainTeaser(brief: string, maxLen: number): string {
  const lines = brief
    .split("\n")
    .filter((l) => !l.trim().startsWith("#"));
  const joined = lines.join(" ").trim();
  const stripped = joined
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLen) return stripped;
  const cut = stripped.substring(0, maxLen);
  // Trim back to a word boundary so the ellipsis doesn't cut a
  // word mid-character.
  return cut.replace(/\s+\S*$/, "") + "…";
}
