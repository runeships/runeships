"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

/**
 * Records the user's chosen account type and routes them to the
 * appropriate next onboarding step. Called by both buttons on
 * /onboarding/select-type.
 *
 * The on_auth_user_created trigger has already inserted a base
 * profile row by the time this fires — we just flip the type.
 */
export async function setAccountType(formData: FormData) {
  const raw = String(formData.get("type") ?? "").trim();
  if (raw !== "student" && raw !== "company") {
    redirect("/onboarding/select-type");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/select-type");

  const { error } = await supabase
    .from("profiles")
    .update({ account_type: raw })
    .eq("id", user.id);
  if (error) {
    console.error("[setAccountType update]", error);
    redirect("/onboarding/select-type?error=1");
  }

  redirect(raw === "company" ? "/onboarding/company" : "/onboarding");
}
