"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export type UpdateCompanyState =
  | { status: "idle" }
  | { status: "saved" }
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
 * Update a company's profile fields. Looks up the company by the
 * signed-in user's profile.company_id — no id parameter from the
 * client so a company user can only ever edit their own company.
 */
export async function updateCompany(
  _prev: UpdateCompanyState,
  formData: FormData,
): Promise<UpdateCompanyState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Your session expired. Sign in again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.account_type !== "company" || !profile.company_id) {
    return {
      status: "error",
      message: "Only company users can edit company info.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { status: "error", message: "Company name can't be empty." };
  }
  if (name.length > 80) {
    return {
      status: "error",
      message: "Company name is too long — keep it under 80 characters.",
    };
  }

  const industry = String(formData.get("industry") ?? "").trim() || null;
  const sizeBandRaw = String(formData.get("size_band") ?? "").trim();
  const sizeBand =
    (SIZE_BANDS as readonly string[]).includes(sizeBandRaw)
      ? sizeBandRaw
      : null;
  const websiteRaw = String(formData.get("website") ?? "").trim();
  const website = websiteRaw.length > 0 ? normalizeWebsite(websiteRaw) : null;
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const categories = formData
    .getAll("task_categories")
    .map(String)
    .filter((c) => (CATEGORIES as readonly string[]).includes(c));

  const admin = createAdminClient();
  const { error } = await admin
    .from("companies")
    .update({
      name,
      industry,
      size_band: sizeBand,
      website,
      description,
      task_categories: categories.length > 0 ? categories : null,
    })
    .eq("id", profile.company_id);
  if (error) {
    console.error("[updateCompany]", error);
    return { status: "error", message: error.message };
  }

  revalidatePath("/companies/profile");
  revalidatePath("/companies/dashboard");
  return { status: "saved" };
}

function normalizeWebsite(s: string): string {
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}
