"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

/**
 * Server action: sign out the current user and bounce to the marketing
 * home. Safe to call from any client component via a <form action={…}>
 * or `signOut()` directly inside a transition.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
