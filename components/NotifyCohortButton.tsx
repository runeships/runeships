"use client";

import { useState, useTransition } from "react";
import { notifyNewTask } from "@/app/actions/notifyNewTask";

/**
 * Three-state button for triggering a cohort-wide new-task email
 * from the admin Tasks list. Click → reveals an inline confirmation
 * with explicit "this sends real emails" copy. Confirm → invokes
 * notifyNewTask, dispatches a runeships:toast with the result.
 *
 * Sends real emails. Doesn't reset to idle after success so the
 * admin can see the row already fired in the same session.
 */
export function NotifyCohortButton({
  taskId,
  taskTitle,
}: {
  taskId: string;
  taskTitle: string;
}) {
  const [stage, setStage] = useState<"idle" | "confirming" | "sent">(
    "idle",
  );
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await notifyNewTask(taskId);
      if (result.success) {
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: {
              text:
                result.sentCount === 0
                  ? `No matching opted-in students for "${taskTitle}".`
                  : `Sent to ${result.sentCount}/${result.matchedCount} students for "${taskTitle}".`,
            },
          }),
        );
        setStage("sent");
      } else {
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: { text: `Failed: ${result.error}` },
          }),
        );
        setStage("idle");
      }
    });
  }

  if (stage === "sent") {
    return (
      <span className="inline-flex items-center text-[12px] tracking-[0.04em] text-muted">
        ✓ Sent
      </span>
    );
  }

  if (stage === "confirming") {
    return (
      <div className="inline-flex flex-wrap items-center gap-3">
        <span className="text-[12px] leading-[1.4] text-ink/85 max-w-[40ch]">
          Send notification to all matching opted-in students? This sends
          real emails.
        </span>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className={`
            inline-flex items-center min-h-[36px] px-4
            bg-oxblood text-cream border border-oxblood
            text-[12px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            ${pending ? "btn-pulse" : ""}
          `}
        >
          {pending ? "Sending…" : "Confirm send"}
        </button>
        <button
          type="button"
          onClick={() => setStage("idle")}
          disabled={pending}
          className="text-[12px] tracking-[0.005em] text-muted link-anim hover:text-ink transition-colors duration-200 ease-out disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setStage("confirming")}
      className="
        inline-flex items-center min-h-[36px] px-4
        bg-transparent text-oxblood border border-oxblood/50
        text-[12px] tracking-[0.01em] font-medium
        transition-colors duration-200 ease-out
        hover:border-oxblood hover:bg-parchment/50
      "
    >
      Notify cohort
    </button>
  );
}
