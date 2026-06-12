"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type UpdateNotificationPrefsResult =
  | { success: true; notifyOnFeedback: boolean }
  | { success: false; error: "unauthorized" | "update_failed" };

/**
 * Toggle a single notification preference. The UI optimistically
 * flips the switch and calls this; on failure the client should
 * snap the switch back.
 */
export async function updateNotificationPrefs(
  notifyOnFeedback: boolean,
): Promise<UpdateNotificationPrefsResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthorized" };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ notify_on_feedback: notifyOnFeedback })
    .eq("id", user.id);

  if (updateError) {
    console.error("[updateNotificationPrefs]", updateError);
    return { success: false, error: "update_failed" };
  }

  revalidatePath("/profile");
  return { success: true, notifyOnFeedback };
}
