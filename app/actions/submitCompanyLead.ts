"use server";

import { supabase } from "@/lib/supabase";
import { resend, RESEND_FROM } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  if (!name)
    return {
      status: "error",
      message: "Add your name so we know who to write back to.",
    };
  if (!email || !EMAIL_RE.test(email))
    return { status: "error", message: "Enter a valid email address." };
  if (!companyName)
    return {
      status: "error",
      message: "Tell us which company you're with.",
    };

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

  // Fire-and-forget confirmation. Failures don't block submission.
  void sendCompanyConfirmation({ name, email, companyName });

  return { status: "success" };
}

async function sendCompanyConfirmation({
  name,
  email,
  companyName,
}: {
  name: string;
  email: string;
  companyName: string;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: "Thanks for reaching out about posting a RuneShips task",
      text: [
        `Hi ${name.split(" ")[0]},`,
        "",
        `Thanks for reaching out about posting a task on RuneShips. We're onboarding pilot company partners and we'll be in touch within 48 hours to discuss the tasks ${companyName} would post.`,
        "",
        "If you have other context or examples you'd like us to see before we connect, just reply to this email.",
        "",
        "— Diego",
        "RuneShips",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[resend company]", err);
  }
}
