/**
 * Transactional email helpers for the human-review evaluation flow.
 * All sends go through the existing Resend client + RESEND_FROM
 * sender from lib/resend.ts. Failures log + return gracefully — the
 * DB row is the source of truth, the email is a courtesy nudge.
 */

import { resend, RESEND_FROM } from "./resend";
import { getAdminEmails } from "./admin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://runeships.com";

// Inline palette — most email clients strip external CSS.
const CREAM = "#FAFAF7";
const INK = "#171514";
const OXBLOOD = "#6B1620";
const MUTED = "#8A847F";
const HAIRLINE = "#E7E2DC";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstNameOf(fullName: string | null | undefined): string {
  if (!fullName) return "there";
  return fullName.trim().split(/\s+/)[0] ?? "there";
}

function shellHtml({
  title,
  body,
}: {
  title: string;
  body: string;
}): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:${CREAM};color:${INK};font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.55;">
  <div style="max-width:560px; margin:0 auto; background:${CREAM}; padding:32px; border:1px solid ${HAIRLINE};">
    <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size:24px; font-weight:300; color:${INK}; letter-spacing:-0.012em;">${escapeHtml(title)}</h1>
    <hr style="margin:20px 0; border:0; border-top:1px solid ${HAIRLINE};" />
    ${body}
  </div>
</body></html>`;
}

function buttonHtml(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${href}" style="display:inline-block;background:${OXBLOOD};color:${CREAM};text-decoration:none;padding:12px 22px;font-weight:500;letter-spacing:0.01em;font-size:14px;border-radius:2px;">${escapeHtml(label)} →</a></p>`;
}

function metaRow(label: string, value: string): string {
  return `<tr><td style="padding:6px 0; color:${MUTED}; font-size:11px; text-transform:uppercase; letter-spacing:0.16em; width:110px; vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0; color:${INK};">${escapeHtml(value)}</td></tr>`;
}

/* ─── Admin notification: new submission in the queue ──────────────── */

type AdminNotificationCtx = {
  submissionId: string;
  taskTitle: string;
  companyName: string;
  studentName: string;
  studentSchool: string | null;
  studentGradYear: number | null;
  submittedAt: string;
};

export async function notifyAdminOfNewSubmission(
  ctx: AdminNotificationCtx,
): Promise<{ ok: boolean }> {
  if (!resend) {
    console.warn("[notifyAdminOfNewSubmission] Resend not configured");
    return { ok: false };
  }
  const admins = getAdminEmails();
  if (admins.length === 0) {
    console.warn(
      "[notifyAdminOfNewSubmission] ADMIN_EMAILS not configured — skipping",
    );
    return { ok: false };
  }

  const studentLine = [
    ctx.studentSchool,
    ctx.studentGradYear ? `Class of ${ctx.studentGradYear}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const reviewUrl = `${SITE_URL}/admin/review/${ctx.submissionId}`;

  const body = `
    <table style="width:100%; border-collapse:collapse;">
      ${metaRow("Student", studentLine ? `${ctx.studentName} (${studentLine})` : ctx.studentName)}
      ${metaRow("Task", ctx.taskTitle)}
      ${metaRow("Company", ctx.companyName)}
      ${metaRow("Submitted", new Date(ctx.submittedAt).toISOString())}
    </table>
    ${buttonHtml(reviewUrl, "Review now")}
    <p style="margin:20px 0 0 0; color:${MUTED}; font-size:12px; line-height:1.55;">
      You&rsquo;re receiving this because you&rsquo;re listed in <code style="font-family: 'SF Mono', Menlo, monospace;">ADMIN_EMAILS</code>.
    </p>
  `;

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: admins,
      subject: `New submission to review: ${ctx.studentName} on ${ctx.taskTitle}`,
      html: shellHtml({ title: "New submission in review queue", body }),
      text: `${ctx.studentName} submitted to ${ctx.taskTitle} (${ctx.companyName}).\n\nReview: ${reviewUrl}`,
    });
    return { ok: true };
  } catch (err) {
    console.error("[notifyAdminOfNewSubmission resend]", err);
    return { ok: false };
  }
}

/* ─── Student notification: human feedback ready ───────────────────── */

type StudentNotificationCtx = {
  submissionId: string;
  studentEmail: string;
  studentName: string | null;
  taskTitle: string;
  totalScore: number;
  notifyOnFeedback: boolean;
  /** 'ai' (Claude-generated) vs 'human' (admin scoring form). The
   *  subject line + lead paragraph adapt accordingly. */
  source: "ai" | "human";
};

export async function notifyStudentOfFeedback(
  ctx: StudentNotificationCtx,
): Promise<{ ok: boolean; skipped?: "opted_out" }> {
  if (!ctx.notifyOnFeedback) {
    return { ok: true, skipped: "opted_out" };
  }
  if (!resend) {
    console.warn("[notifyStudentOfFeedback] Resend not configured");
    return { ok: false };
  }

  const firstName = firstNameOf(ctx.studentName);
  const submissionUrl = `${SITE_URL}/submissions/${ctx.submissionId}`;
  const roundedTotal = Math.round(ctx.totalScore);
  const isHuman = ctx.source === "human";
  const subject = isHuman
    ? "Your RuneShips feedback is ready — reviewed by the team"
    : "Your RuneShips feedback is ready";
  const humanSentence = isHuman
    ? " Your submission was reviewed personally by the RuneShips team."
    : "";

  const body = `
    <p style="margin:0 0 16px 0; color:${INK};">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px 0; color:${INK}; line-height:1.6;">
      Your submission on <strong>${escapeHtml(ctx.taskTitle)}</strong> has been reviewed.
      Total score: <strong style="color:${OXBLOOD};">${roundedTotal}/100</strong>.
      View your full feedback for per-dimension scores and qualitative notes from the reviewer.${humanSentence}
    </p>
    ${buttonHtml(submissionUrl, "View feedback")}
    <p style="margin:20px 0 0 0; color:${MUTED}; font-size:12px; line-height:1.55;">
      You can adjust feedback notification settings in your profile.
    </p>
  `;

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: ctx.studentEmail,
      replyTo: "hello@runeships.com",
      subject,
      html: shellHtml({ title: "Your feedback is ready", body }),
      text: `Hi ${firstName},\n\nYour submission on ${ctx.taskTitle} has been reviewed. Total score: ${roundedTotal}/100.${humanSentence}\n\nView: ${submissionUrl}`,
    });
    return { ok: true };
  } catch (err) {
    console.error("[notifyStudentOfFeedback resend]", err);
    return { ok: false };
  }
}

/* ─── Student notification: new task matching their interests ─────── */

type NewTaskNotificationCtx = {
  recipientEmail: string;
  recipientName: string | null;
  taskTitle: string;
  taskSlug: string;
  companyName: string;
  companySlug: string;
  estimatedTime: string | null;
  /** Capitalized dimension names (e.g. ['Strategy', 'Communication']). */
  primaryDimensions: string[];
  /** Plain-text teaser, already trimmed and ellipsised. */
  briefTeaser: string;
};

export async function notifyStudentOfNewTask(
  ctx: NewTaskNotificationCtx,
): Promise<{ ok: boolean }> {
  if (!resend) {
    console.warn("[notifyStudentOfNewTask] Resend not configured");
    return { ok: false };
  }

  const taskUrl = `${SITE_URL}/tasks/${ctx.companySlug}/${ctx.taskSlug}`;
  const profileUrl = `${SITE_URL}/profile?tab=account`;
  const dims = ctx.primaryDimensions
    .map((d) => escapeHtml(d.toUpperCase()))
    .join(
      ` <span style="color:${MUTED};" aria-hidden="true">·</span> `,
    );

  const body = `
    <p style="margin:0 0 18px 0; font-family: Georgia, 'Times New Roman', serif; font-size:22px; font-weight:300; line-height:1.2; color:${INK}; letter-spacing:-0.012em;">
      ${escapeHtml(ctx.taskTitle)}
    </p>
    <p style="margin:0 0 10px 0; color:${MUTED}; font-size:13px;">
      Posted by <span style="color:${INK};">${escapeHtml(ctx.companyName)}</span>${ctx.estimatedTime ? ` <span style="color:${MUTED};">·</span> Est. ${escapeHtml(ctx.estimatedTime)}` : ""}
    </p>
    <p style="margin:0 0 18px 0; color:${OXBLOOD}; font-size:11px; letter-spacing:0.16em;">
      ${dims}
    </p>
    <p style="margin:0 0 8px 0; color:${INK}; line-height:1.6; font-size:14px;">
      ${escapeHtml(ctx.briefTeaser)}
    </p>
    ${buttonHtml(taskUrl, "View task")}
    <p style="margin:24px 0 0 0; color:${MUTED}; font-size:12px; line-height:1.55;">
      You&rsquo;re receiving this because you opted in to new task notifications. Adjust your preferences in your <a href="${profileUrl}" style="color:${OXBLOOD}; text-decoration: underline;">profile</a>.
    </p>
  `;

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: ctx.recipientEmail,
      replyTo: "hello@runeships.com",
      subject: `New task on RuneShips: ${ctx.taskTitle}`,
      html: shellHtml({ title: "A new task is live.", body }),
      text: `${ctx.taskTitle}\nPosted by ${ctx.companyName}${ctx.estimatedTime ? ` · Est. ${ctx.estimatedTime}` : ""}\n\n${ctx.briefTeaser}\n\nView: ${taskUrl}`,
    });
    return { ok: true };
  } catch (err) {
    console.error("[notifyStudentOfNewTask resend]", err);
    return { ok: false };
  }
}
