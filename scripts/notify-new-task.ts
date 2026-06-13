/**
 * Manually trigger a "new task" email blast from the terminal.
 *
 * Usage:
 *   npm run notify-task -- <task-slug>
 *   npm run notify-task -- marketing-video
 *
 * Looks up the task by slug, then invokes the same notification
 * pipeline the admin UI button uses (lib/emails.ts ->
 * notifyStudentOfNewTask). Filters by is_seed=false +
 * notify_on_new_tasks=true + career_tracks overlap with the task's
 * primary dimensions (weight >= 0.20).
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY +
 * RESEND_API_KEY from .env.local. The notifyNewTask server action
 * itself can't be invoked from outside a Next request, so this
 * script re-implements the same flow using the lib helpers
 * directly.
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { Resend } from "resend";
import type { Database } from "../lib/database.types";

loadEnv({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;

if (!URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}
if (!RESEND_KEY) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}

const admin = createClient<Database>(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const resend = new Resend(RESEND_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runeships.com";
const RESEND_FROM = "RuneShips <hello@runeships.com>";

const ALL_DIMENSIONS = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
] as const;
type Dimension = (typeof ALL_DIMENSIONS)[number];

const PRIMARY_WEIGHT_THRESHOLD = 0.2;

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run notify-task -- <task-slug>");
    process.exit(1);
  }

  console.log(`Looking up task with slug='${slug}'…`);
  const { data: task, error: taskErr } = await admin
    .from("tasks")
    .select(
      "id, slug, title, brief, estimated_time, company_id, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (taskErr || !task) {
    console.error("Task not found.", taskErr);
    process.exit(1);
  }
  console.log(`  → ${task.title}`);

  const { data: company } = await admin
    .from("companies")
    .select("slug, name")
    .eq("id", task.company_id)
    .maybeSingle();
  if (!company) {
    console.error("Company not found for task.");
    process.exit(1);
  }

  // Determine primary dimensions.
  const primaryDimensions: Dimension[] = [];
  for (const d of ALL_DIMENSIONS) {
    const weightKey = `weight_${d}` as `weight_${typeof d}`;
    if ((task[weightKey] ?? 0) >= PRIMARY_WEIGHT_THRESHOLD) {
      primaryDimensions.push(d);
    }
  }
  const primaryCapitalized = primaryDimensions.map(
    (d) => d.charAt(0).toUpperCase() + d.slice(1),
  );
  console.log(`  primary dimensions: ${primaryCapitalized.join(", ")}`);

  // Query opted-in real students.
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, career_tracks")
    .eq("leaderboard_visible", true)
    .eq("notify_on_new_tasks", true)
    .eq("is_seed", false);

  const primarySet = new Set(primaryCapitalized);
  const matching = (profiles ?? []).filter((p) => {
    const tracks = p.career_tracks ?? [];
    if (tracks.length === 0) return true;
    if (tracks.some((t) => t === "Other")) return true;
    return tracks.some((t) => primarySet.has(t));
  });
  console.log(
    `  matched ${matching.length} students out of ${profiles?.length ?? 0} opted-in`,
  );

  if (matching.length === 0) {
    console.log("Nothing to send. Done.");
    return;
  }

  const briefTeaser = plainTeaser(task.brief, 200);

  let sent = 0;
  for (const p of matching) {
    process.stdout.write(`  → ${p.email} … `);
    try {
      await resend.emails.send({
        from: RESEND_FROM,
        to: p.email,
        replyTo: "hello@runeships.com",
        subject: `New task on RuneShips: ${task.title}`,
        html: buildHtml({
          taskTitle: task.title,
          companyName: company.name,
          estimatedTime: task.estimated_time,
          primaryDimensions: primaryCapitalized,
          briefTeaser,
          taskUrl: `${SITE_URL}/tasks/${company.slug}/${task.slug}`,
          profileUrl: `${SITE_URL}/profile?tab=account`,
        }),
      });
      console.log("ok");
      sent++;
    } catch (err) {
      console.log("failed:", err);
    }
  }

  console.log(`\nSent ${sent}/${matching.length} emails.`);
}

function plainTeaser(brief: string, maxLen: number): string {
  const lines = brief.split("\n").filter((l) => !l.trim().startsWith("#"));
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
  return cut.replace(/\s+\S*$/, "") + "…";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(ctx: {
  taskTitle: string;
  companyName: string;
  estimatedTime: string | null;
  primaryDimensions: string[];
  briefTeaser: string;
  taskUrl: string;
  profileUrl: string;
}): string {
  const CREAM = "#FAFAF7";
  const INK = "#171514";
  const OXBLOOD = "#6B1620";
  const MUTED = "#8A847F";
  const HAIRLINE = "#E7E2DC";
  const dims = ctx.primaryDimensions
    .map((d) => escapeHtml(d.toUpperCase()))
    .join(` <span style="color:${MUTED};">·</span> `);
  return `<!doctype html><html><body style="margin:0;padding:24px;background:${CREAM};color:${INK};font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.55;">
  <div style="max-width:560px;margin:0 auto;background:${CREAM};padding:32px;border:1px solid ${HAIRLINE};">
    <h1 style="margin:0;font-family: Georgia, 'Times New Roman', serif;font-size:24px;font-weight:300;color:${INK};letter-spacing:-0.012em;">A new task is live.</h1>
    <hr style="margin:20px 0;border:0;border-top:1px solid ${HAIRLINE};" />
    <p style="margin:0 0 18px 0;font-family: Georgia, 'Times New Roman', serif;font-size:22px;font-weight:300;line-height:1.2;color:${INK};letter-spacing:-0.012em;">${escapeHtml(ctx.taskTitle)}</p>
    <p style="margin:0 0 10px 0;color:${MUTED};font-size:13px;">Posted by <span style="color:${INK};">${escapeHtml(ctx.companyName)}</span>${ctx.estimatedTime ? ` <span style="color:${MUTED};">·</span> Est. ${escapeHtml(ctx.estimatedTime)}` : ""}</p>
    <p style="margin:0 0 18px 0;color:${OXBLOOD};font-size:11px;letter-spacing:0.16em;">${dims}</p>
    <p style="margin:0 0 8px 0;color:${INK};line-height:1.6;font-size:14px;">${escapeHtml(ctx.briefTeaser)}</p>
    <p style="margin:24px 0;"><a href="${ctx.taskUrl}" style="display:inline-block;background:${OXBLOOD};color:${CREAM};text-decoration:none;padding:12px 22px;font-weight:500;letter-spacing:0.01em;font-size:14px;border-radius:2px;">View task →</a></p>
    <p style="margin:24px 0 0 0;color:${MUTED};font-size:12px;line-height:1.55;">You&rsquo;re receiving this because you opted in to new task notifications. Adjust your preferences in your <a href="${ctx.profileUrl}" style="color:${OXBLOOD};text-decoration: underline;">profile</a>.</p>
  </div>
</body></html>`;
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
