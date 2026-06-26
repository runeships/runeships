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

  // Fire-and-forget: confirmation to the submitter, notification to us.
  // Failures don't block submission.
  void sendCompanyConfirmation({ name, email, companyName });
  void sendCompanyNotification({ name, email, companyName, taskDescription });

  return { status: "success" };
}

/**
 * Where new company-lead notifications get sent. Override per env if
 * you want them routed elsewhere (a Slack-by-email address, a personal
 * inbox, etc.) without touching the action.
 */
const TEAM_NOTIFICATION_TO =
  process.env.TEAM_NOTIFICATION_EMAIL ?? "hello@runeships.com";

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
        "Diego",
        "RuneShips",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[resend company confirmation]", err);
  }
}

/**
 * Internal notification: when a new company lead lands, ping the team
 * inbox with the form contents so we don't have to poll the DB. Sets
 * `reply_to` to the submitter's address so replying-to-this-email
 * goes straight to them.
 */
async function sendCompanyNotification({
  name,
  email,
  companyName,
  taskDescription,
}: {
  name: string;
  email: string;
  companyName: string;
  taskDescription: string;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: TEAM_NOTIFICATION_TO,
      replyTo: email,
      subject: `New company lead — ${companyName} (${name})`,
      text: [
        `New "Talk to us" submission from the landing page.`,
        "",
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Company: ${companyName}`,
        "",
        "Tasks they'd post:",
        taskDescription || "(not provided)",
        "",
        "Reply to this email and it will go straight to the submitter.",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[resend company notification]", err);
  }
}
