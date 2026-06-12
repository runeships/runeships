"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "error"; message: string };

/**
 * Permanently deletes the signed-in user's account. Validates the
 * type-to-confirm email match server-side too — never trust the
 * client's disabled-button state alone.
 *
 * Cascade behavior: profiles, submissions, feedback, regrade_requests
 * all have ON DELETE CASCADE pointing back at auth.users(id), so the
 * single admin.deleteUser() call wipes everything.
 *
 * Sign-out then redirect to /?deleted=1 — the landing page reads the
 * query param and renders a one-time "Account deleted" notice above
 * the hero.
 */
export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "Your session expired. Sign in again to continue.",
    };
  }

  const confirmEmail = String(formData.get("confirm_email") ?? "")
    .trim()
    .toLowerCase();
  const actualEmail = (user.email ?? "").trim().toLowerCase();

  if (!actualEmail) {
    return {
      status: "error",
      message: "Couldn’t verify your email. Refresh and try again.",
    };
  }
  if (confirmEmail !== actualEmail) {
    return {
      status: "error",
      message:
        "Email didn’t match. Type it exactly as it appears in your account.",
    };
  }

  // Use admin client to actually drop the auth row. This cascades
  // through every FK pointing at auth.users.
  const admin = createAdminClient();
  const { error: deleteError } = await admin.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    console.error("[deleteAccount]", deleteError);
    return {
      status: "error",
      message: "Something went wrong deleting the account. Try again.",
    };
  }

  // Clear the session cookie. signOut() against a deleted user is a
  // no-op on the server but does the cookie housekeeping.
  await supabase.auth.signOut();

  redirect("/?deleted=1");
}
