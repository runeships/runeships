"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type NotificationPrefs = {
  notifyOnFeedback?: boolean;
  notifyOnNewTasks?: boolean;
};

export type UpdateNotificationPrefsResult =
  | { success: true; prefs: NotificationPrefs }
  | { success: false; error: "unauthorized" | "update_failed" };

/**
 * Update one or both of the student's notification toggles. Each
 * toggle is independent — the AccountTab calls this once per flip
 * with only the changed pref set. Omit a key entirely to leave it
 * untouched.
 */
export async function updateNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<UpdateNotificationPrefsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthorized" };

  // Build the partial update — only keys present in `prefs` are
  // forwarded, so an undefined key doesn't accidentally overwrite a
  // value that's been set elsewhere.
  const updateObj: {
    notify_on_feedback?: boolean;
    notify_on_new_tasks?: boolean;
  } = {};
  if (prefs.notifyOnFeedback !== undefined) {
    updateObj.notify_on_feedback = prefs.notifyOnFeedback;
  }
  if (prefs.notifyOnNewTasks !== undefined) {
    updateObj.notify_on_new_tasks = prefs.notifyOnNewTasks;
  }
  if (Object.keys(updateObj).length === 0) {
    // No-op — nothing to write.
    return { success: true, prefs };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateObj)
    .eq("id", user.id);

  if (updateError) {
    console.error("[updateNotificationPrefs]", updateError);
    return { success: false, error: "update_failed" };
  }

  revalidatePath("/profile");
  return { success: true, prefs };
}
