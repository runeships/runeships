"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getRankings } from "@/lib/rankings";
import { generateResumeCode } from "@/lib/resumeCode";

export type CvBulletState =
  | { status: "idle" }
  | {
      status: "success";
      bullet: string;
      resumeCode: string;
    }
  | {
      status: "error";
      message: string;
      reason?: "no_auth" | "seed" | "internal";
    };

/** Generate a 2-sentence CV bullet for the current student.
 *  No cooldown — the snippet is free to produce and they may want
 *  to regenerate after completing more tasks. Seed accounts are
 *  blocked so they can't manufacture fake credentials. */
export async function generateCvBullet(): Promise<CvBulletState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "Sign in to generate your CV bullet.",
      reason: "no_auth",
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, is_seed, resume_code")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return {
      status: "error",
      message: "Profile not found. Finish onboarding first.",
      reason: "no_auth",
    };
  }
  if (profile.is_seed) {
    return {
      status: "error",
      message: "Demo accounts can't generate CV bullets.",
      reason: "seed",
    };
  }

  // Assign a verification code on first call. Retry on the
  // vanishingly rare unique-constraint collision.
  let resumeCode = profile.resume_code;
  if (!resumeCode) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateResumeCode();
      const { error } = await admin
        .from("profiles")
        .update({ resume_code: candidate })
        .eq("id", profile.id)
        .is("resume_code", null);
      if (!error) {
        resumeCode = candidate;
        break;
      }
    }
    if (!resumeCode) {
      return {
        status: "error",
        message: "Couldn't assign a verification code. Try again.",
        reason: "internal",
      };
    }
  }

  const rankings = await getRankings(user.id);

  const { count: taskCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  // Stamp last-generated for the public /v/[code] page's "updated"
  // line. Best-effort.
  try {
    await admin
      .from("profiles")
      .update({ last_resume_at: new Date().toISOString() })
      .eq("id", profile.id);
  } catch (err) {
    console.error("[generateCvBullet stamp]", err);
  }

  return {
    status: "success",
    bullet: buildBullet({
      cohortSize: rankings.cohortSize,
      overallPercentile: rankings.overallPercentile,
      taskCount: taskCount ?? 0,
      resumeCode,
    }),
    resumeCode,
  };
}

function buildBullet(ctx: {
  cohortSize: number;
  overallPercentile: number | null;
  taskCount: number;
  resumeCode: string;
}): string {
  const verifyUrl = `runeships.com/v/${ctx.resumeCode}`;
  if (
    ctx.overallPercentile !== null &&
    ctx.taskCount >= 1 &&
    ctx.cohortSize > 0
  ) {
    const topPct = Math.max(1, 100 - ctx.overallPercentile);
    return `Ranked in the top ${topPct}% of ${ctx.cohortSize.toLocaleString()} students on RuneShips, a skill assessment platform evaluating real business tasks across strategy, execution, communication, technical, and creativity. Verified at ${verifyUrl}.`;
  }
  return `Active on RuneShips, completing real business tasks evaluated across five professional skill dimensions: strategy, execution, communication, technical, and creativity. Verified profile at ${verifyUrl}.`;
}
