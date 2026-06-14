"use server";

import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { resend, RESEND_FROM } from "@/lib/resend";

export type NotifyTermsUpdateResult =
  | { ok: true; sent: number; failed: number }
  | { ok: false; error: string };

/**
 * Manually-invoked broadcast for material Terms updates. Section 19
 * commits us to ≥14 days' advance notice. When you actually amend
 * the Terms, run this once with the new effective date and a short
 * summary; recipients are users with notify_on_feedback=true (the
 * cheapest proxy we have for "active" — they've opted into
 * platform email).
 *
 * Stub for now: admin-only, no UI surface. Invoke from a server
 * action call site (e.g. a one-off admin route or an ad-hoc
 * server-side script) when you ship a real update.
 */
export async function notifyTermsUpdate({
  effectiveDate,
  summary,
}: {
  /** Human-readable date the update takes effect, e.g. "August 1, 2026". */
  effectiveDate: string;
  /** 1-3 sentence summary of what changed and why. Plain text. */
  summary: string;
}): Promise<NotifyTermsUpdateResult> {
  await requireAdmin();

  if (!resend) {
    return { ok: false, error: "Resend not configured" };
  }
  if (!effectiveDate || !summary) {
    return { ok: false, error: "Missing effectiveDate or summary" };
  }

  const admin = createAdminClient();
  const { data: recipients, error: recErr } = await admin
    .from("profiles")
    .select("email")
    .eq("notify_on_feedback", true)
    .not("email", "is", null);
  if (recErr) {
    console.error("[notifyTermsUpdate fetch]", recErr);
    return { ok: false, error: recErr.message };
  }
  const emails = Array.from(
    new Set((recipients ?? []).map((r) => r.email).filter(Boolean) as string[]),
  );

  const subject = "Updates to RuneShips Terms of Service";
  const intro = `We're writing to let you know we've updated the RuneShips Terms of Service. The updated Terms take effect on ${effectiveDate}.`;
  const ack = `By continuing to use the platform after that date, you accept the updated Terms. If you don't agree to the changes, you can stop using RuneShips at any time and delete your account from /profile?tab=account.`;
  const text = `${intro}\n\nWhat changed:\n${summary}\n\n${ack}\n\nRead the full Terms: https://runeships.com/terms\n\nQuestions? Reply to this email.\n\nRuneShips`;

  let sent = 0;
  let failed = 0;
  for (const to of emails) {
    try {
      await resend.emails.send({
        from: RESEND_FROM,
        to,
        subject,
        text,
      });
      sent++;
    } catch (err) {
      console.error("[notifyTermsUpdate send]", to, err);
      failed++;
    }
  }
  return { ok: true, sent, failed };
}
