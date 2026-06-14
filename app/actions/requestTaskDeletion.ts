"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { notifyAdminOfDeletionRequest } from "@/lib/emails";

export type RequestDeletionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Company-facing soft-delete request. Marks tasks.deletion_requested_at,
 * stores an optional note, and emails the RuneShips admin queue. The
 * task stays live until admin acts on it from /admin/tasks.
 */
export async function requestTaskDeletion(
  _prev: RequestDeletionState,
  formData: FormData,
): Promise<RequestDeletionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Your session expired. Sign in again." };
  }

  const taskId = String(formData.get("task_id") ?? "").trim();
  if (!taskId) {
    return { status: "error", message: "Missing task id." };
  }
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;

  const admin = createAdminClient();

  // Caller must be the owning company.
  const { data: profile } = await admin
    .from("profiles")
    .select("account_type, company_id, email")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.account_type !== "company" || !profile.company_id) {
    return { status: "error", message: "Only company users can do that." };
  }

  const { data: task } = await admin
    .from("tasks")
    .select("id, title, company_id, deletion_requested_at")
    .eq("id", taskId)
    .maybeSingle();
  if (!task || task.company_id !== profile.company_id) {
    return { status: "error", message: "Task not found." };
  }
  if (task.deletion_requested_at) {
    return { status: "error", message: "You already requested this." };
  }

  const requestedAt = new Date().toISOString();
  const { error: updErr } = await admin
    .from("tasks")
    .update({
      deletion_requested_at: requestedAt,
      deletion_request_note: note,
    })
    .eq("id", task.id);
  if (updErr) {
    console.error("[requestTaskDeletion update]", updErr);
    return { status: "error", message: "Couldn't save the request." };
  }

  const { data: company } = await admin
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .maybeSingle();

  try {
    await notifyAdminOfDeletionRequest({
      taskId: task.id,
      taskTitle: task.title,
      companyName: company?.name ?? "(unknown)",
      requesterEmail: profile.email ?? user.email ?? "(unknown)",
      note,
      requestedAt,
    });
  } catch (err) {
    console.error("[requestTaskDeletion notify]", err);
  }

  revalidatePath(`/companies/tasks/${task.id}`);
  return { status: "success" };
}
