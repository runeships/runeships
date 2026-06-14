"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { slugify, uniqueSlug } from "@/lib/slugify";

export type CreateTaskState =
  | { status: "idle" }
  | { status: "error"; message: string };

const CATEGORY_VALUES = [
  "writing",
  "deck",
  "code",
  "spreadsheet",
  "strategy",
  "design",
] as const;
const SUBMISSION_MODES = ["text_only", "link_only", "text_and_link"] as const;
const EVALUATION_MODES = ["ai", "human"] as const;

const ALL_DIMS = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
] as const;

type Attachment = {
  filename: string;
  url: string;
  size: number;
  content_type: string;
  storage_path: string;
};

/**
 * Server-side task creation. Files have already been uploaded to
 * Supabase Storage by the client (the createTask form's onSubmit
 * uploads via supabase-browser, then passes the resulting URLs
 * here as JSON in `attachments_json`). This action validates the
 * metadata, persists the task row, and redirects to the company-side
 * task detail page.
 */
export async function createTask(
  _prev: CreateTaskState,
  formData: FormData,
): Promise<CreateTaskState> {
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
      message: "Only company users can post tasks.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { status: "error", message: "Please add a task title." };
  }
  if (title.length > 200) {
    return {
      status: "error",
      message: "Title is too long — keep it under 200 characters.",
    };
  }

  const brief = String(formData.get("brief") ?? "").trim();
  const submissionModeRaw = String(formData.get("submission_mode") ?? "").trim();
  const submissionMode = (SUBMISSION_MODES as readonly string[]).includes(
    submissionModeRaw,
  )
    ? submissionModeRaw
    : "link_only";

  const categoryRaw = String(formData.get("category") ?? "").trim();
  const category = (CATEGORY_VALUES as readonly string[]).includes(categoryRaw)
    ? categoryRaw
    : "strategy";

  const estimatedTimeRaw = String(formData.get("estimated_time") ?? "").trim();
  const estimatedTime = estimatedTimeRaw.length > 0 ? estimatedTimeRaw : null;

  const evaluationModeRaw = String(formData.get("evaluation_mode") ?? "").trim();
  const evaluationMode = (EVALUATION_MODES as readonly string[]).includes(
    evaluationModeRaw,
  )
    ? evaluationModeRaw
    : "ai";

  // Weights. Default to equal 0.20 if any input is missing/invalid.
  const weights = ALL_DIMS.reduce<Record<string, number>>((acc, d) => {
    const raw = formData.get(`weight_${d}`);
    const n = Number(raw);
    acc[d] = Number.isFinite(n) && n >= 0 && n <= 1 ? n : 0.2;
    return acc;
  }, {});
  const weightsSum = Object.values(weights).reduce((s, n) => s + n, 0);
  // Normalize to exactly 1.0 to satisfy the weights_sum_to_one check.
  if (Math.abs(weightsSum - 1) > 0.001) {
    if (weightsSum > 0) {
      for (const d of ALL_DIMS) weights[d] = weights[d] / weightsSum;
    } else {
      for (const d of ALL_DIMS) weights[d] = 0.2;
    }
  }

  // Attachments (pre-uploaded by the client).
  let attachments: Attachment[] = [];
  const attachmentsJson = String(formData.get("attachments_json") ?? "[]");
  try {
    const parsed = JSON.parse(attachmentsJson);
    if (Array.isArray(parsed)) {
      attachments = parsed
        .filter(
          (a): a is Attachment =>
            typeof a === "object" &&
            a !== null &&
            typeof a.filename === "string" &&
            typeof a.url === "string" &&
            typeof a.size === "number" &&
            typeof a.content_type === "string" &&
            typeof a.storage_path === "string",
        )
        .slice(0, 5);
    }
  } catch (err) {
    console.error("[createTask attachments parse]", err);
  }

  // Generate a unique slug scoped within the company's tasks.
  const admin = createAdminClient();
  const { data: existingSlugs } = await admin
    .from("tasks")
    .select("slug")
    .eq("company_id", profile.company_id);
  const slugSet = new Set((existingSlugs ?? []).map((t) => t.slug));
  const slug = uniqueSlug(slugify(title), slugSet);

  const { data: inserted, error: insertErr } = await admin
    .from("tasks")
    .insert({
      company_id: profile.company_id,
      created_by: user.id,
      slug,
      title,
      brief,
      submission_mode: submissionMode as "text_only" | "link_only" | "text_and_link",
      estimated_time: estimatedTime,
      weight_strategy: weights.strategy,
      weight_execution: weights.execution,
      weight_communication: weights.communication,
      weight_technical: weights.technical,
      weight_creativity: weights.creativity,
      category: category as "writing" | "deck" | "code" | "spreadsheet" | "strategy" | "design",
      evaluation_mode: evaluationMode as "ai" | "human",
      is_published: true,
      is_demo: false,
      attachments: attachments,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[createTask insert]", insertErr);
    return {
      status: "error",
      message: "Couldn't post the task. Try again.",
    };
  }

  redirect(`/companies/tasks/${inserted.id}`);
}
