"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Flip a company user's email-notification preference. Currently the
 * only company-targeted email is `notify_on_new_submission` (sent
 * when an admin releases a submission to the company), so this acts
 * as the master email toggle for that account.
 *
 * Returns {success: boolean}. The form caller does an optimistic
 * UI flip and rolls back on failure.
 */
export async function updateCompanyNotifications(payload: {
  notifyOnNewSubmission: boolean;
}): Promise<{ success: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.account_type !== "company") {
    return { success: false };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ notify_on_new_submission: payload.notifyOnNewSubmission })
    .eq("id", user.id);
  if (error) {
    console.error("[updateCompanyNotifications]", error);
    return { success: false };
  }
  return { success: true };
}
