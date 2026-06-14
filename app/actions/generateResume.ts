"use server";

import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getRankings } from "@/lib/rankings";
import {
  generateResumeCode,
  isInResumeCooldown,
  nextResumeAvailableAt,
} from "@/lib/resumeCode";
import { ResumePdf, type ResumePdfData } from "@/components/ResumePdf";

// PDF generation typically completes in 2-4 seconds for a single
// A4 page using built-in fonts (Helvetica + Times-Roman). The default
// Vercel function timeout (10s) is enough. `maxDuration` cannot be
// exported from a "use server" file — Route Segment Config must live
// on a page/route, not an action. If we ever need longer timeouts,
// move to a Route Handler at /api/resume.

const MAX_TASKS_ON_PDF = 8;
const DIM_LABELS: Record<ResumePdfData["dimensions"][number]["key"], string> = {
  strategy: "Strategy",
  execution: "Execution",
  communication: "Communication",
  technical: "Technical",
  creativity: "Creativity",
};

export type GenerateResumeState =
  | { status: "idle" }
  | {
      status: "success";
      resumeCode: string;
      pdfBase64: string;
      filename: string;
    }
  | {
      status: "error";
      message: string;
      reason?: "cooldown" | "seed" | "no_auth" | "internal";
      nextAvailableAt?: string;
    };

/** Confirmation surface for "are you sure, you have no tasks" lives
 *  in the client. The server action trusts the request and renders. */
export async function generateResume(): Promise<GenerateResumeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      status: "error",
      message: "Sign in to generate a resume.",
      reason: "no_auth",
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id, full_name, school, graduation_year, account_type, is_seed, last_resume_at, resume_code",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return {
      status: "error",
      message: "Profile not found. Finish onboarding first.",
      reason: "no_auth",
    };
  }

  // Block seed personas from generating credentials they shouldn't have.
  if (profile.is_seed) {
    return {
      status: "error",
      message: "Demo accounts can't generate resumes.",
      reason: "seed",
    };
  }

  // Cooldown gate.
  if (isInResumeCooldown(profile.last_resume_at)) {
    return {
      status: "error",
      message: "You can only generate a new resume once per week.",
      reason: "cooldown",
      nextAvailableAt: nextResumeAvailableAt(profile.last_resume_at!),
    };
  }

  // Ensure a verification code. Retry on the (extremely rare) unique
  // constraint hit.
  let resumeCode = profile.resume_code;
  if (!resumeCode) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateResumeCode();
      const { error: setErr } = await admin
        .from("profiles")
        .update({ resume_code: candidate })
        .eq("id", profile.id)
        .is("resume_code", null);
      if (!setErr) {
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

  // Rankings.
  let rankings;
  try {
    rankings = await getRankings(user.id);
  } catch (err) {
    console.error("[generateResume rankings]", err);
    return {
      status: "error",
      message: "Couldn't compute your standing. Try again later.",
      reason: "internal",
    };
  }

  // Completed tasks with feedback.
  const completedTasks = await loadCompletedTasks(admin, user.id);
  const taskCount = completedTasks.length;
  const tasksForPdf = completedTasks.slice(0, MAX_TASKS_ON_PDF);
  const extraTaskCount = Math.max(0, taskCount - MAX_TASKS_ON_PDF);

  // Build PDF data shape.
  const generatedAt = new Date().toISOString();
  const data: ResumePdfData = {
    studentName: profile.full_name?.trim() || "(unnamed student)",
    studentSchool: profile.school,
    studentGradYear: profile.graduation_year,
    resumeCode,
    generatedAt,
    cohortSize: rankings.cohortSize,
    overallPercentile: rankings.overallPercentile,
    overallAggregate: rankings.overallAggregate,
    isProvisional: rankings.isProvisional,
    taskCount,
    dimensions: (
      ["strategy", "execution", "communication", "technical", "creativity"] as const
    ).map((key) => ({
      key,
      label: DIM_LABELS[key],
      aggregate: rankings.userAggregates[key],
      percentile: rankings.userPercentiles[key],
    })),
    completedTasks: tasksForPdf,
    extraTaskCount,
  };

  // Render the PDF.
  let buffer: Buffer;
  try {
    // ResumePdf returns a <Document> at the root — cast through unknown
    // so TS lets the createElement result satisfy renderToBuffer.
    const element = createElement(ResumePdf, { data }) as unknown as ReactElement<DocumentProps>;
    buffer = await renderToBuffer(element);
  } catch (err) {
    console.error("[generateResume render]", err);
    return {
      status: "error",
      message: "PDF generation failed. Try again.",
      reason: "internal",
    };
  }

  // Stamp last_resume_at so the cooldown engages.
  const { error: stampErr } = await admin
    .from("profiles")
    .update({ last_resume_at: generatedAt })
    .eq("id", profile.id);
  if (stampErr) {
    // The user gets the PDF either way — don't block on the stamp.
    console.error("[generateResume stamp]", stampErr);
  }

  return {
    status: "success",
    resumeCode,
    pdfBase64: buffer.toString("base64"),
    filename: buildFilename(profile.full_name),
  };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

async function loadCompletedTasks(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<ResumePdfData["completedTasks"]> {
  const { data: submissions } = await admin
    .from("submissions")
    .select("id, task_id, created_at")
    .eq("user_id", userId);
  if (!submissions || submissions.length === 0) return [];

  const submissionIds = submissions.map((s) => s.id);
  const taskIds = Array.from(new Set(submissions.map((s) => s.task_id)));

  const [feedbackRes, tasksRes] = await Promise.all([
    admin
      .from("feedback")
      .select("submission_id, total_score, generated_at")
      .in("submission_id", submissionIds),
    admin
      .from("tasks")
      .select("id, title, category, company_id")
      .in("id", taskIds),
  ]);
  const fbBySub = new Map(
    (feedbackRes.data ?? []).map((f) => [f.submission_id, f]),
  );
  const taskById = new Map(
    (tasksRes.data ?? []).map((t) => [t.id, t]),
  );
  const companyIds = Array.from(
    new Set((tasksRes.data ?? []).map((t) => t.company_id)),
  );
  const { data: companies } = companyIds.length
    ? await admin.from("companies").select("id, name").in("id", companyIds)
    : { data: [] };
  const companyById = new Map(
    (companies ?? []).map((c) => [c.id, c]),
  );

  // For tasks with multiple submissions, keep the highest-scoring one.
  const bestPerTask = new Map<
    string,
    {
      title: string;
      companyName: string;
      category: string;
      totalScore: number;
      completedAt: string;
    }
  >();
  for (const sub of submissions) {
    const fb = fbBySub.get(sub.id);
    if (!fb) continue;
    const task = taskById.get(sub.task_id);
    if (!task) continue;
    const company = companyById.get(task.company_id);
    const existing = bestPerTask.get(sub.task_id);
    if (!existing || fb.total_score > existing.totalScore) {
      bestPerTask.set(sub.task_id, {
        title: task.title,
        companyName: company?.name ?? "(unknown)",
        category: String(task.category ?? "—"),
        totalScore: fb.total_score,
        completedAt: fb.generated_at ?? sub.created_at,
      });
    }
  }

  return Array.from(bestPerTask.values()).sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

function buildFilename(fullName: string | null): string {
  const slug = (fullName ?? "runeships")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `runeships-resume-${slug || "student"}.pdf`;
}
