"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestRegrade } from "@/app/actions/requestRegrade";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Your session expired. Sign in again and retry.",
  submission_not_found: "We couldn’t find this submission.",
  no_feedback:
    "There’s no AI grade to dispute yet. Generate feedback first.",
  already_requested:
    "You’ve already requested a regrade for this submission.",
  insert_failed: "Something went wrong. Try again in a moment.",
};

/**
 * Two-step regrade request: button → confirm panel → submit.
 *
 * The confirm step is load-bearing — the regrade can lower the score
 * and we want students to read that before committing. Once
 * submitted, the parent re-renders via router.refresh() so the page
 * shows the "already requested" state from server state, not local
 * state.
 */
export function RegradeButton({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await requestRegrade(submissionId);
      if (result.success) {
        router.refresh();
        return;
      }
      setError(
        ERROR_MESSAGES[result.error] ??
          "Something went wrong. Try again in a moment.",
      );
    });
  }

  if (confirming) {
    return (
      <div className="border-l-2 border-oxblood pl-6 sm:pl-8 max-w-[60ch]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          Confirm regrade request
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] text-ink/85">
          A human reviewer will replace this AI grade. The new score
          could be{" "}
          <span className="text-ink font-medium">higher, lower,</span>{" "}
          or unchanged. You can only request this once per submission.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            aria-busy={pending}
            className={`
              inline-flex items-center
              min-h-[48px] px-7
              bg-oxblood text-cream border border-oxblood
              text-[14px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              disabled:opacity-50 disabled:cursor-not-allowed
              ${pending ? "btn-pulse" : ""}
            `}
          >
            {pending ? "Submitting…" : "Yes, request regrade"}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={pending}
            className="
              link-anim text-[14px] tracking-[0.005em] text-muted
              hover:text-ink transition-colors duration-200 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 text-[14px] leading-snug text-oxblood"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="
          inline-flex items-center
          min-h-[44px] px-5
          bg-transparent text-ink
          border border-ink/30
          text-[13px] tracking-[0.02em] font-medium
          transition-colors duration-200 ease-out
          hover:border-oxblood hover:text-oxblood
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
        "
      >
        Request human regrade
      </button>
      <p className="mt-3 text-[12px] tracking-[0.005em] text-muted max-w-[52ch]">
        Unhappy with this grade? A human reviewer will take a fresh
        look. Note that the new score could go up or down.
      </p>
    </div>
  );
}

/**
 * Read-only confirmation state — used by the parent server component
 * when a regrade_requests row already exists for this submission.
 */
export function RegradeRequestedPanel({
  requestedAt,
  status,
}: {
  requestedAt: string;
  status: "pending" | "resolved" | "declined";
}) {
  const requestedDate = new Date(requestedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statusLine =
    status === "pending"
      ? "A human reviewer will take a fresh look at your work. You'll be notified once the grade is updated."
      : status === "resolved"
      ? "This submission has been reviewed by a human. The scores above reflect the updated grade."
      : "After review, the original AI grade was kept. See the written feedback below.";

  return (
    <div className="border-l-2 border-oxblood pl-6 sm:pl-8 max-w-[60ch]">
      <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
        {status === "pending"
          ? "Regrade requested"
          : status === "resolved"
          ? "Human review complete"
          : "Regrade reviewed"}
      </p>
      <p className="mt-4 text-[16px] leading-[1.6] text-ink/85">
        Requested on {requestedDate}. {statusLine}
      </p>
    </div>
  );
}
