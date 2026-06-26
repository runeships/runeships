"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminUpdateTask,
  adminDeleteTask,
  type AdminUpdateTaskState,
  type AdminDeleteTaskState,
} from "@/app/actions/adminTaskActions";

const initial: AdminUpdateTaskState = { status: "idle" };
const initialDelete: AdminDeleteTaskState = { status: "idle" };

const CATEGORIES = [
  { value: "writing", label: "Writing" },
  { value: "deck", label: "Pitch deck" },
  { value: "code", label: "Code" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "strategy", label: "Strategy" },
  { value: "design", label: "Design" },
];
const SUBMISSION_MODES = [
  { value: "text_only", label: "Text answer" },
  { value: "link_only", label: "Link to work" },
  { value: "text_and_link", label: "Both" },
];
const EVALUATION_MODES = [
  { value: "ai", label: "AI feedback only" },
  { value: "human", label: "AI feedback + human reviewer" },
];

type TaskShape = {
  id: string;
  title: string;
  brief: string;
  category: string;
  submission_mode: string;
  evaluation_mode: string;
  is_published: boolean;
  has_deletion_request: boolean;
  ai_token_budget: number;
  ai_tokens_used: number;
};

export function AdminEditTaskForm({ task }: { task: TaskShape }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    adminUpdateTask,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    adminDeleteTask,
    initialDelete,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Navigate after the delete action completes. Doing it client-side
  // dodges the Next 16 server-action redirect timing issue for slow
  // actions (storage purge can take a beat on tasks with many files).
  useEffect(() => {
    if (deleteState.status === "deleted") {
      router.push("/admin/tasks?deleted=1");
    }
  }, [deleteState, router]);

  return (
    <>
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={task.id} />

        <Field label="Title">
          <input
            name="title"
            type="text"
            defaultValue={task.title}
            required
            disabled={pending}
            className={inputCls}
          />
        </Field>

        <Field label="Brief">
          <textarea
            name="brief"
            rows={8}
            defaultValue={task.brief}
            disabled={pending}
            className={`${inputCls} resize-y min-h-[160px]`}
          />
        </Field>

        <Field label="Category">
          <select
            name="category"
            defaultValue={task.category}
            disabled={pending}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Submission mode">
          <select
            name="submission_mode"
            defaultValue={task.submission_mode}
            disabled={pending}
            className={inputCls}
          >
            {SUBMISSION_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Evaluation mode">
          <select
            name="evaluation_mode"
            defaultValue={task.evaluation_mode}
            disabled={pending}
            className={inputCls}
          >
            {EVALUATION_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={task.is_published}
            disabled={pending}
            className="accent-oxblood"
          />
          <span className="text-[14px] text-ink">
            Published (visible to students)
          </span>
        </label>

        <Field label="AI token budget (shared across all submissions to this task)">
          <input
            name="ai_token_budget"
            type="number"
            min={0}
            step={1000}
            defaultValue={task.ai_token_budget}
            disabled={pending}
            className={inputCls}
          />
          <p className="mt-2 text-[12px] text-muted">
            Used so far: <span className="tabular-nums">{task.ai_tokens_used.toLocaleString()}</span>{" "}
            / <span className="tabular-nums">{task.ai_token_budget.toLocaleString()}</span>{" "}
            ({task.ai_token_budget > 0
              ? Math.round((task.ai_tokens_used / task.ai_token_budget) * 100)
              : 0}
            %). Bump the budget if you want more AI-graded submissions on this
            task; otherwise overflow falls to your manual review queue.
          </p>
          <label className="mt-3 flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="reset_ai_tokens_used"
              disabled={pending}
              className="accent-oxblood"
            />
            <span className="text-[13px] text-ink">
              Reset usage counter to 0 (use after bumping the budget if you
              want previous spend not to count).
            </span>
          </label>
        </Field>

        {task.has_deletion_request && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="clear_deletion_request"
              disabled={pending}
              className="accent-oxblood"
            />
            <span className="text-[14px] text-ink">
              Clear deletion request (decide to keep this task live)
            </span>
          </label>
        )}

        {state.status === "error" && (
          <p role="alert" className="text-[13px] text-oxblood">
            {state.message}
          </p>
        )}
        {state.status === "saved" && (
          <p className="text-[13px] text-oxblood">Saved.</p>
        )}

        <div className="flex items-center gap-5 pt-4 border-t border-ink/10">
          <button
            type="submit"
            disabled={pending}
            className="
              inline-flex items-center min-h-[48px] px-6
              bg-oxblood text-cream border border-oxblood
              text-[14px] tracking-[0.01em] font-medium
              hover:bg-oxblood-hover transition-colors duration-200 ease-out
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Delete is a separate form so it doesn't trigger the update
          validation. Two-step confirm keeps misclicks from nuking
          submissions. */}
      <div className="mt-14 pt-8 border-t border-ink/10">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Danger zone
        </p>
        <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[58ch]">
          Deleting removes the task, every submission to it, every
          feedback row, and every attachment file in storage. The
          company&rsquo;s storage quota is freed accordingly. This
          can&rsquo;t be undone.
        </p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="
              mt-5 inline-flex items-center min-h-[40px] px-5
              border border-oxblood text-oxblood text-[13px]
              hover:bg-oxblood hover:text-cream
              transition-colors duration-200 ease-out
            "
          >
            Delete task
          </button>
        ) : (
          <>
            <form action={deleteAction} className="mt-5 flex items-center gap-5">
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                disabled={deletePending || deleteState.status === "deleted"}
                className="
                  inline-flex items-center min-h-[40px] px-5
                  bg-oxblood text-cream border border-oxblood text-[13px]
                  hover:bg-oxblood-hover transition-colors duration-200 ease-out
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {deletePending
                  ? "Deleting…"
                  : deleteState.status === "deleted"
                  ? "Cleaning up…"
                  : "Yes, delete forever"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deletePending}
                className="link-anim text-[12px] text-muted hover:text-ink transition-colors duration-200 ease-out"
              >
                Cancel
              </button>
            </form>
            {deleteState.status === "error" && (
              <p role="alert" className="mt-3 text-[13px] text-oxblood">
                {deleteState.message}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

const inputCls = `
  w-full min-h-[48px] px-4 py-2.5
  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
  text-[15px] tracking-[-0.005em] leading-[1.5]
  outline-none
  transition-colors duration-150 ease-out
  focus:border-oxblood focus:ring-1 focus:ring-oxblood
  disabled:opacity-60 disabled:cursor-not-allowed
`;
