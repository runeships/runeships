"use server";

import { supabase } from "@/lib/supabase";
import { resend, RESEND_FROM } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistState =
  | { status: "idle" }
  | { status: "success"; alreadyOnList?: boolean }
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
    // 23505 = unique_violation. Re-signups are not a user-facing error.
    if (error.code === "23505") {
      return { status: "success", alreadyOnList: true };
    }
    console.error("[waitlist insert]", error);
    return {
      status: "error",
      message: "Something went wrong on our side. Try again in a moment.",
    };
  }

  // Fire-and-forget confirmation. Failures don't block signup.
  void sendWaitlistConfirmation(email);

  return { status: "success" };
}

async function sendWaitlistConfirmation(email: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: "Thanks for joining the RuneShips waitlist",
      text: [
        "Thanks for joining the RuneShips waitlist.",
        "",
        "We're building a way for students to prove their work directly — real company tasks, AI feedback in minutes, a portable skill rank recruiters can trust.",
        "",
        "We'll email the moment early access opens.",
        "",
        "— Diego",
        "RuneShips",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[resend waitlist]", err);
  }
}
