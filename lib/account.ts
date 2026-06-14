import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

/**
 * Branch-on-account-type helpers. Use at the top of any route that
 * should only serve one side of the platform.
 *
 *   const { user, profile, company } = await requireCompanyUser();
 *
 * Redirects:
 *   - no auth → /login?next=…
 *   - no profile yet → /onboarding/select-type
 *   - account_type mismatch → the other side's home
 */

export async function requireCompanyUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/companies/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, account_type, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/select-type");
  if (profile.account_type !== "company") redirect("/dashboard");
  if (!profile.company_id) redirect("/onboarding/company");

  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, slug, name, industry, size_band, website, owner_email, task_categories, description",
    )
    .eq("id", profile.company_id)
    .maybeSingle();
  if (!company) redirect("/onboarding/company");

  return { user, profile, company };
}

export async function requireStudentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, account_type, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding/select-type");
  if (profile.account_type === "company") redirect("/companies/dashboard");
  if (!profile.onboarding_completed) redirect("/onboarding");
  return { user, profile };
}

/** Boolean variant for layout-level decisions (StickyNav variant pick). */
export async function getAccountContext(): Promise<{
  isAuthed: boolean;
  accountType: "student" | "company" | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAuthed: false, accountType: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();
  return {
    isAuthed: true,
    accountType: profile?.account_type ?? null,
  };
}
