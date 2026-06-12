"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateFeedback } from "@/app/actions/generateFeedback";

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Your session expired. Sign in again and retry.",
  submission_not_found: "We couldn’t find this submission.",
  task_not_found: "We couldn’t find the task for this submission.",
  api_failed:
    "Anthropic didn’t respond in time. Try again in a moment — your submission is still saved.",
  parse_failed:
    "The model returned something we couldn’t parse. Try again — your submission is still saved.",
  insert_failed:
    "We generated the feedback but couldn’t save it. Try again.",
};

/**
 * Retry control on /submissions/[id] when feedback didn't generate
 * (or didn't survive parsing). Calls generateFeedback and refreshes
 * the page on success so the parent server component re-fetches the
 * now-existing feedback row.
 */
export function RetryFeedbackButton({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      setError(null);
      const result = await generateFeedback(submissionId);
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

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        className={`
          inline-flex items-center
          min-h-[52px] px-7
          bg-oxblood text-cream
          border border-oxblood
          text-[15px] tracking-[0.01em] font-medium
          transition-colors duration-200 ease-out
          hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
          disabled:cursor-not-allowed
          ${pending ? "btn-pulse" : ""}
        `}
      >
        {pending ? "Generating…" : "Generate feedback"}
      </button>
      {pending && (
        <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[58ch]">
          This usually takes 30–60 seconds.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 text-[14px] leading-snug text-oxblood max-w-[58ch]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
