"use server";

import { createClient } from "@/lib/supabase-server";

/**
 * Server action: sign out the current user. Returns once the session
 * cookie has been cleared; the caller is responsible for navigating
 * client-side (typically router.push("/") inside a transition).
 *
 * Previously this threw redirect("/") server-side, but the Next 16
 * server-action redirect protocol can be unreliable for actions that
 * end with cookie writes — client-side navigation is sturdier.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
