"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type UpdateLeaderboardVisibilityResult =
  | { success: true; leaderboardVisible: boolean }
  | { success: false; error: "unauthorized" | "update_failed" };

/**
 * Toggle the user's opt-in to the public leaderboard + cohort
 * percentile aggregates. Mirror of updateNotificationPrefs: the
 * UI flips the switch optimistically and snaps it back on failure.
 */
export async function updateLeaderboardVisibility(
  leaderboardVisible: boolean,
): Promise<UpdateLeaderboardVisibilityResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "unauthorized" };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ leaderboard_visible: leaderboardVisible })
    .eq("id", user.id);

  if (updateError) {
    console.error("[updateLeaderboardVisibility]", updateError);
    return { success: false, error: "update_failed" };
  }

  // Bust caches that depend on cohort membership.
  revalidatePath("/profile");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { success: true, leaderboardVisible };
}
