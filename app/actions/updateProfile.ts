"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export type UpdateProfileState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Updates the editable fields on the signed-in user's profile row.
 * Same shape of validation as completeOnboarding but tolerates empty
 * specific_skills (some users may clear them).
 *
 * Returns { status: "success" } so the form can flash a toast and
 * stay on the page — no redirect.
 */
export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      status: "error",
      message: "Your session expired. Sign in again to continue.",
    };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const gradYearRaw = formData.get("graduation_year");
  const gradYear = gradYearRaw ? Number(gradYearRaw) : null;
  const tracks = formData
    .getAll("career_tracks")
    .map(String)
    .filter(Boolean);
  const specificSkills = formData
    .getAll("specific_skills")
    .map(String)
    .filter(Boolean);

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
  if (tracks.length === 0)
    return error("Pick at least one career track.");

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      school,
      graduation_year: gradYear,
      career_tracks: tracks,
      specific_skills: specificSkills,
      self_rated_strategy: skills.strategy,
      self_rated_execution: skills.execution,
      self_rated_communication: skills.communication,
      self_rated_technical: skills.technical,
      self_rated_creativity: skills.creativity,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("[updateProfile]", updateError);
    return error("Couldn’t save your profile. Try again in a moment.");
  }

  // Refresh server-rendered surfaces that show profile data — the
  // dashboard radar in particular reads the self-rated values.
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { status: "success" };
}

function clamp(n: number): number {
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function error(message: string): UpdateProfileState {
  return { status: "error", message };
}
