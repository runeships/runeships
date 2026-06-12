"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export type OnboardingState =
  | { status: "idle" }
  | { status: "error"; message: string };

/**
 * Server action: write the onboarding answers into public.profiles and
 * flip onboarding_completed. On success redirects to /dashboard; on
 * error returns a state object the form can render inline.
 */
export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const gradYearRaw = formData.get("graduation_year");
  const gradYear = gradYearRaw ? Number(gradYearRaw) : null;
  const tracks = formData.getAll("career_tracks").map(String).filter(Boolean);
  const otherTrack = String(formData.get("other_track") ?? "").trim();
  const specificSkills = formData
    .getAll("specific_skills")
    .map(String)
    .filter(Boolean);
  const otherSkill = String(formData.get("other_skill") ?? "").trim();

  const skills = {
    strategy: clamp(Number(formData.get("skill_strategy") ?? 50)),
    execution: clamp(Number(formData.get("skill_execution") ?? 50)),
    communication: clamp(Number(formData.get("skill_communication") ?? 50)),
    technical: clamp(Number(formData.get("skill_technical") ?? 50)),
    creativity: clamp(Number(formData.get("skill_creativity") ?? 50)),
  };

  if (!fullName) return error("Please add your name.");
  if (!school) return error("Please add your school.");
  if (!gradYear || gradYear < 2024 || gradYear > 2032)
    return error("Pick a graduation year.");
  if (tracks.length === 0 && !otherTrack)
    return error("Pick at least one career track you’re aiming at.");

  const allTracks = otherTrack ? [...tracks, otherTrack] : tracks;
  const allSkills = otherSkill
    ? [...specificSkills, otherSkill]
    : specificSkills;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return error("Your session expired. Sign in again to continue.");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      school,
      graduation_year: gradYear,
      career_tracks: allTracks,
      specific_skills: allSkills,
      self_rated_strategy: skills.strategy,
      self_rated_execution: skills.execution,
      self_rated_communication: skills.communication,
      self_rated_technical: skills.technical,
      self_rated_creativity: skills.creativity,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[onboarding update]", updateError);
    return error("Couldn’t save your profile. Try again in a moment.");
  }

  redirect("/dashboard");
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function error(message: string): OnboardingState {
  return { status: "error", message };
}
