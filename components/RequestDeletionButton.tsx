"use client";

import { useActionState, useState } from "react";
import {
  requestTaskDeletion,
  type RequestDeletionState,
} from "@/app/actions/requestTaskDeletion";

const initial: RequestDeletionState = { status: "idle" };

export function RequestDeletionButton({
  taskId,
  alreadyRequestedAt,
}: {
  taskId: string;
  alreadyRequestedAt: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    requestTaskDeletion,
    initial,
  );
  const [open, setOpen] = useState(false);

  if (alreadyRequestedAt || state.status === "success") {
    return (
      <p className="text-[12px] tracking-[0.04em] uppercase text-muted">
        Deletion requested · awaiting RuneShips admin
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="link-anim text-[12px] tracking-[0.04em] uppercase text-muted hover:text-oxblood transition-colors duration-200 ease-out"
      >
        Request task deletion
      </button>
    );
  }

  return (
    <form action={formAction} className="max-w-[58ch]">
      <input type="hidden" name="task_id" value={taskId} />
      <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
        Request deletion
      </p>
      <p className="mt-3 text-[13px] leading-[1.55] text-muted">
        We&rsquo;ll email the RuneShips team and they&rsquo;ll remove it within a
        day or two. Submissions students have already made will be deleted
        too. Add a short reason if you want.
      </p>
      <textarea
        name="note"
        rows={3}
        maxLength={1000}
        disabled={pending}
        placeholder="Optional. Why are you removing it?"
        className="
          mt-4 w-full min-h-[80px] px-3 py-2
          border border-ink/25 bg-cream text-ink placeholder:text-muted/80
          text-[14px] leading-[1.5]
          outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood
          disabled:opacity-60
        "
      />
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-[13px] text-oxblood">
          {state.message}
        </p>
      )}
      <div className="mt-4 flex items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          className="
            inline-flex items-center min-h-[40px] px-5
            bg-oxblood text-cream border border-oxblood
            text-[13px] tracking-[0.005em]
            hover:bg-oxblood-hover transition-colors duration-200 ease-out
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {pending ? "Sending…" : "Send request"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="link-anim text-[12px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
