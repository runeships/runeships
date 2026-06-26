"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { slugify, uniqueSlug } from "@/lib/slugify";

export type CreateCompanyState =
  | { status: "idle" }
  | { status: "error"; message: string };

const SIZE_BANDS = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
const CATEGORIES = [
  "Writing",
  "Pitch deck",
  "Code",
  "Spreadsheet",
  "Strategy",
  "Design",
] as const;

/**
 * Onboarding action for a brand-new company. Inserts the companies
 * row via service-role (RLS-bypass), links the profile to the new
 * company, then redirects to the company dashboard.
 *
 * Only the name is required. Industry, size, website, and category
 * preferences are all optional.
 */
export async function createCompany(
  _prev: CreateCompanyState,
  formData: FormData,
): Promise<CreateCompanyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Your session expired. Sign in again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const sizeBandRaw = String(formData.get("size_band") ?? "").trim();
  const sizeBand =
    (SIZE_BANDS as readonly string[]).includes(sizeBandRaw)
      ? sizeBandRaw
      : null;
  const websiteRaw = String(formData.get("website") ?? "").trim();
  const website = websiteRaw.length > 0 ? normalizeWebsite(websiteRaw) : null;
  const categories = formData
    .getAll("task_categories")
    .map(String)
    .filter((c) => (CATEGORIES as readonly string[]).includes(c));

  if (!name) {
    return { status: "error", message: "Please add your company name." };
  }
  if (name.length > 80) {
    return {
      status: "error",
      message: "Company name is too long; keep it under 80 characters.",
    };
  }

  const termsAccepted = formData.get("terms_accepted");
  if (termsAccepted !== "on" && termsAccepted !== "true") {
    return {
      status: "error",
      message:
        "You must accept the Terms of Service, Privacy Policy, and Cookies Policy to continue.",
    };
  }

  // Generate a unique slug for the new company.
  const admin = createAdminClient();
  const { data: existing } = await admin.from("companies").select("slug");
  const existingSlugs = new Set((existing ?? []).map((c) => c.slug));
  const slug = uniqueSlug(slugify(name), existingSlugs);

  const { data: company, error: insertErr } = await admin
    .from("companies")
    .insert({
      slug,
      name,
      industry,
      size_band: sizeBand,
      website,
      owner_email: user.email ?? null,
      task_categories: categories.length > 0 ? categories : null,
      is_practice: false,
    })
    .select("id")
    .single();
  if (insertErr || !company) {
    console.error("[createCompany insert]", insertErr);
    return {
      status: "error",
      message: "Couldn't create the company. Try again.",
    };
  }

  // Link the profile.
  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      company_id: company.id,
      full_name: user.email?.split("@")[0] ?? "Company user",
      onboarding_completed: true,
      terms_accepted_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileErr) {
    console.error("[createCompany link profile]", profileErr);
    return {
      status: "error",
      message: "Couldn't link your account to the company. Try again.",
    };
  }

  redirect("/companies/dashboard");
}

function normalizeWebsite(s: string): string {
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
