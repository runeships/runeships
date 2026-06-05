"use server";

import { supabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const source = String(formData.get("source") ?? "landing_hero").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, source: source || "landing_hero" });

  if (error) {
    // 23505 = unique_violation. Treat re-signups as success so users don't
    // get a hostile error for an action that effectively succeeded already.
    if (error.code === "23505") {
      return { status: "success" };
    }
    console.error("[waitlist insert]", error);
    return {
      status: "error",
      message: "Something went wrong on our side. Try again in a moment.",
    };
  }

  return { status: "success" };
}

export type CompanyLeadState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitCompanyLead(
  _prev: CompanyLeadState,
  formData: FormData,
): Promise<CompanyLeadState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const companyName = String(formData.get("company_name") ?? "").trim();
  const taskDescription = String(formData.get("task_description") ?? "").trim();

  if (!name) return { status: "error", message: "Add your name so we know who to write back to." };
  if (!email || !EMAIL_RE.test(email))
    return { status: "error", message: "Enter a valid email address." };
  if (!companyName)
    return { status: "error", message: "Tell us which company you're with." };

  const { error } = await supabase.from("company_leads").insert({
    name,
    email,
    company_name: companyName,
    task_description: taskDescription || null,
  });

  if (error) {
    console.error("[company_leads insert]", error);
    return {
      status: "error",
      message: "Something went wrong on our side. Try again in a moment.",
    };
  }

  return { status: "success" };
}
