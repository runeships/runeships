"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { checkTaskBriefForBias } from "@/lib/biasCheck";

export type CreateTaskState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; taskId: string };

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

  // Required acknowledgment that this is an unpaid practice/screening
  // task, not production work. Validated server-side — never trust the
  // client's disabled-button state alone.
  const unpaidAck =
    formData.get("unpaid_ack") === "on" ||
    formData.get("unpaid_ack") === "true";
  if (!unpaidAck) {
    return {
      status: "error",
      message:
        "Please confirm this is an unpaid practice task, not production work you'd otherwise pay for.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { status: "error", message: "Please add a task title." };
  }
  if (title.length > 200) {
    return {
      status: "error",
      message: "Title is too long; keep it under 200 characters.",
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

  // Attachments (pre-uploaded by the client). The client JSON is a
  // CLAIM to verify, not trusted input: each storage_path must live
  // under this company's own prefix, and the byte size + public URL are
  // read back from storage rather than taken from the client. Without
  // this, a crafted storage_path pointing at another company's object
  // would flow into the service-role storage.remove() cleanup below
  // (cross-tenant file deletion), and a spoofed size would defeat the
  // quota.
  const rawAttachments: Attachment[] = [];
  const attachmentsJson = String(formData.get("attachments_json") ?? "[]");
  try {
    const parsed = JSON.parse(attachmentsJson);
    if (Array.isArray(parsed)) {
      rawAttachments.push(
        ...parsed
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
          .slice(0, 5),
      );
    }
  } catch (err) {
    console.error("[createTask attachments parse]", err);
  }

  const admin = createAdminClient();

  // ─── Validate paths + derive real sizes from storage ─────────────
  // Reject (never silently drop) a path outside this company's prefix.
  const companyPrefix = `${profile.company_id}/`;
  const attachments: Attachment[] = [];
  for (const a of rawAttachments) {
    if (!a.storage_path.startsWith(companyPrefix)) {
      console.error("[createTask attachment path rejected]", {
        company_id: profile.company_id,
        storage_path: a.storage_path,
      });
      return {
        status: "error",
        message:
          "One of the uploaded files has an invalid path. Refresh the page and re-upload.",
      };
    }
    const slash = a.storage_path.lastIndexOf("/");
    const dir = a.storage_path.slice(0, slash);
    const name = a.storage_path.slice(slash + 1);
    const { data: listing, error: listErr } = await admin.storage
      .from("task-attachments")
      .list(dir, { search: name, limit: 100 });
    const obj = (listing ?? []).find((o) => o.name === name);
    const realSize =
      typeof obj?.metadata?.size === "number"
        ? (obj.metadata.size as number)
        : null;
    if (listErr || realSize === null) {
      console.error("[createTask attachment not found in storage]", {
        storage_path: a.storage_path,
        listErr,
      });
      return {
        status: "error",
        message:
          "One of the uploaded files couldn't be verified in storage. Refresh the page and re-upload.",
      };
    }
    const { data: pub } = admin.storage
      .from("task-attachments")
      .getPublicUrl(a.storage_path);
    attachments.push({
      filename: a.filename,
      content_type: a.content_type,
      storage_path: a.storage_path,
      size: realSize,
      url: pub.publicUrl,
    });
  }

  // ─── Storage quota check ─────────────────────────────────────────
  // Files are already in Supabase Storage at this point (the client
  // uploads direct to the bucket before posting the form). If this
  // task would push the company over MAX_COMPANY_STORAGE_BYTES, we
  // delete the freshly-uploaded files and reject. Every path here is
  // guaranteed to be under this company's prefix, so remove() can only
  // ever touch the company's own objects. Otherwise we increment the
  // counter after the task insert succeeds.
  const MAX_COMPANY_STORAGE_BYTES = 500 * 1024 * 1024; // 500 MB
  const incomingBytes = attachments.reduce((s, a) => s + a.size, 0);
  if (incomingBytes > 0) {
    const { data: companyRow } = await admin
      .from("companies")
      .select("storage_bytes_used")
      .eq("id", profile.company_id)
      .maybeSingle();
    const currentBytes = companyRow?.storage_bytes_used ?? 0;
    if (currentBytes + incomingBytes > MAX_COMPANY_STORAGE_BYTES) {
      // Orphan cleanup — the files in storage are now wasted; pull
      // them back out so the bucket doesn't bloat.
      const paths = attachments
        .map((a) => a.storage_path)
        .filter(Boolean);
      if (paths.length > 0) {
        await admin.storage.from("task-attachments").remove(paths);
      }
      const remainingMb = Math.max(
        0,
        Math.floor((MAX_COMPANY_STORAGE_BYTES - currentBytes) / (1024 * 1024)),
      );
      return {
        status: "error",
        message: `Storage quota reached. Your company has ${remainingMb} MB left of the 500 MB limit; drop the attachments or shrink them and try again.`,
      };
    }
  }

  // ─── Bias review (best-effort) ───────────────────────────────────
  // Runs an AI moderation pass on the brief. If flagged, we still
  // publish the task (false positives shouldn't gate company users)
  // but mark it for admin review so /admin/tasks shows a badge.
  const biasCheck = brief.trim().length > 0
    ? await checkTaskBriefForBias(title, brief)
    : { flagged: false, note: null };

  // Generate a unique slug scoped within the company's tasks.
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
      bias_review_needed: biasCheck.flagged,
      bias_review_note: biasCheck.note,
      unpaid_ack_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // Stamp company storage usage so the quota engages for future
  // uploads. Best-effort — if this errors the task still ships;
  // worst case is the bucket fills faster than the counter says.
  if (incomingBytes > 0) {
    try {
      const { data: companyRow } = await admin
        .from("companies")
        .select("storage_bytes_used")
        .eq("id", profile.company_id)
        .maybeSingle();
      const newTotal = (companyRow?.storage_bytes_used ?? 0) + incomingBytes;
      await admin
        .from("companies")
        .update({ storage_bytes_used: newTotal })
        .eq("id", profile.company_id);
    } catch (err) {
      console.error("[createTask storage stamp]", err);
    }
  }

  if (insertErr || !inserted) {
    console.error("[createTask insert]", insertErr);
    return {
      status: "error",
      message: "Couldn't post the task. Try again.",
    };
  }

  return { status: "success", taskId: inserted.id };
}
