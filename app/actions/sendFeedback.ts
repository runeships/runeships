"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend, RESEND_FROM } from "@/lib/resend";

const FEEDBACK_INBOX = "hello@runeships.com";
const MAX_LENGTH = 2000;
const FEEDBACK_DAILY_CAP = 5;
const FEEDBACK_WINDOW_MS = 24 * 60 * 60 * 1000;

const CATEGORIES = ["bug", "suggestion", "praise", "question", "other"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_LABEL: Record<Category, string> = {
  bug: "Bug or issue",
  suggestion: "Suggestion",
  praise: "Praise / what's working",
  question: "Question",
  other: "Other",
};

export type SendFeedbackResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Sends a feedback email from the signed-in user to the team inbox.
 *
 * Identity is pulled server-side from the profile row so the sender
 * line in the email can't be spoofed by the client. Reply-To is the
 * user's auth email so a reply from the inbox reaches them directly.
 */
export async function sendFeedback(input: {
  category: string;
  feedback: string;
  pageUrl: string;
}): Promise<SendFeedbackResult> {
  // ─── Auth + identity ─────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Your session expired. Sign in again." };
  }
  const email = user.email ?? "(no email on file)";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = profile?.full_name?.trim() || "(unnamed student)";

  // ─── Validation ──────────────────────────────────────────────
  const category = (CATEGORIES as readonly string[]).includes(input.category)
    ? (input.category as Category)
    : "other";
  const feedback = input.feedback?.trim() ?? "";
  if (feedback.length === 0) {
    return { success: false, error: "Please add a message before sending." };
  }
  if (feedback.length > MAX_LENGTH) {
    return {
      success: false,
      error: `Feedback is too long; please keep it under ${MAX_LENGTH} characters.`,
    };
  }

  // ─── Per-user rate limit ─────────────────────────────────────
  // Cap at FEEDBACK_DAILY_CAP per 24h per user. Keeps the inbox
  // useful and protects the Resend monthly quota from a sit-on-
  // the-button attack. Best-effort — if the log read fails we
  // still let the message through.
  const admin = createAdminClient();
  try {
    const windowStart = new Date(
      Date.now() - FEEDBACK_WINDOW_MS,
    ).toISOString();
    const { count } = await admin
      .from("feedback_submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", windowStart);
    if ((count ?? 0) >= FEEDBACK_DAILY_CAP) {
      return {
        success: false,
        error: `You've hit the ${FEEDBACK_DAILY_CAP}-message daily limit. Email hello@runeships.com directly if it's urgent.`,
      };
    }
  } catch (err) {
    console.error("[sendFeedback rate check]", err);
  }

  const pageUrl =
    typeof input.pageUrl === "string" && input.pageUrl.length > 0
      ? input.pageUrl.slice(0, 500)
      : "(unknown)";

  // ─── Email assembly ──────────────────────────────────────────
  if (!resend) {
    console.error("[sendFeedback] Resend not configured");
    return {
      success: false,
      error:
        "Email service is not configured. Reach out directly at hello@runeships.com.",
    };
  }

  const timestamp = new Date().toISOString();
  const categoryLabel = CATEGORY_LABEL[category];
  const subject = `RuneShips feedback [${category}] — ${name}`;
  const html = buildHtml({
    name,
    email,
    categoryLabel,
    pageUrl,
    timestamp,
    feedback,
  });
  const text = buildText({
    name,
    email,
    categoryLabel,
    pageUrl,
    timestamp,
    feedback,
  });

  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: FEEDBACK_INBOX,
      replyTo: email,
      subject,
      html,
      text,
    });
    // Log only after a successful send so a failed send doesn't
    // count against the cap.
    try {
      await admin
        .from("feedback_submissions")
        .insert({ user_id: user.id });
    } catch (err) {
      console.error("[sendFeedback log]", err);
    }
  } catch (err) {
    console.error("[sendFeedback resend]", err);
    return {
      success: false,
      error:
        "Couldn't send right now. Try again in a moment, or email hello@runeships.com directly.",
    };
  }

  return { success: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EmailCtx = {
  name: string;
  email: string;
  categoryLabel: string;
  pageUrl: string;
  timestamp: string;
  feedback: string;
};

function buildHtml(ctx: EmailCtx): string {
  // Inline styles — editorial cream/oxblood palette to match the
  // rest of the brand. No external CSS — most email clients strip it.
  const cream = "#FAFAF7";
  const ink = "#171514";
  const oxblood = "#6B1620";
  const muted = "#8A847F";
  const hairline = "#E7E2DC";
  return `<!doctype html><html><body style="margin:0;padding:24px;background:${cream};color:${ink};font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; line-height: 1.55;">
  <div style="max-width:560px; margin:0 auto; background:${cream}; padding:32px; border:1px solid ${hairline};">
    <h1 style="margin:0; font-family: Georgia, 'Times New Roman', serif; font-size:24px; font-weight:300; color:${ink}; letter-spacing:-0.012em;">New feedback received</h1>
    <hr style="margin:20px 0; border:0; border-top:1px solid ${hairline};" />
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:6px 0; color:${muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.16em; width:90px;">Sender</td><td style="padding:6px 0; color:${ink};">${escapeHtml(ctx.name)} &lt;${escapeHtml(ctx.email)}&gt;</td></tr>
      <tr><td style="padding:6px 0; color:${muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.16em;">Category</td><td style="padding:6px 0; color:${ink};">${escapeHtml(ctx.categoryLabel)}</td></tr>
      <tr><td style="padding:6px 0; color:${muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.16em;">Page</td><td style="padding:6px 0; color:${ink}; word-break:break-all;">${escapeHtml(ctx.pageUrl)}</td></tr>
      <tr><td style="padding:6px 0; color:${muted}; font-size:11px; text-transform:uppercase; letter-spacing:0.16em;">Sent</td><td style="padding:6px 0; color:${muted}; font-size:12px;">${escapeHtml(ctx.timestamp)}</td></tr>
    </table>
    <hr style="margin:24px 0; border:0; border-top:1px solid ${hairline};" />
    <h2 style="margin:0 0 12px 0; font-family: Georgia, 'Times New Roman', serif; font-size:18px; font-weight:400; color:${oxblood}; letter-spacing:-0.008em;">Message</h2>
    <p style="margin:0; color:${ink}; white-space:pre-line;">${escapeHtml(ctx.feedback)}</p>
  </div>
</body></html>`;
}

function buildText(ctx: EmailCtx): string {
  return [
    `New feedback received`,
    `---`,
    `Sender:   ${ctx.name} <${ctx.email}>`,
    `Category: ${ctx.categoryLabel}`,
    `Page:     ${ctx.pageUrl}`,
    `Sent:     ${ctx.timestamp}`,
    `---`,
    `Message:`,
    ``,
    ctx.feedback,
  ].join("\n");
}
