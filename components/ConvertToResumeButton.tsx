"use client";

import { useState, useTransition } from "react";
import { Download, Lock } from "lucide-react";
import { generateResume } from "@/app/actions/generateResume";
import {
  daysUntilNextResume,
  isInResumeCooldown,
} from "@/lib/resumeCode";

/** Convert to resume — student-only StickyNav button.
 *
 *  - Locked state if user is in cooldown (shows days remaining in
 *    a small tooltip).
 *  - Confirmation modal when user has 0 completed tasks (resume
 *    would be mostly empty).
 *  - On success: downloads the PDF via a Blob+URL.createObjectURL
 *    pattern and shows an inline success message with the
 *    verification code. */
export function ConvertToResumeButton({
  initialLastResumeAt,
  hasCompletedTasks,
}: {
  initialLastResumeAt: string | null;
  hasCompletedTasks: boolean;
}) {
  const [lastResumeAt, setLastResumeAt] = useState(initialLastResumeAt);
  const [pending, startTransition] = useTransition();
  const [confirmingEmpty, setConfirmingEmpty] = useState(false);
  const [success, setSuccess] = useState<{ code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const locked = isInResumeCooldown(lastResumeAt);
  const daysLeft = daysUntilNextResume(lastResumeAt);

  function runGeneration() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await generateResume();
      if (result.status === "success") {
        triggerDownload(result.pdfBase64, result.filename);
        setSuccess({ code: result.resumeCode });
        // Cooldown engages on the server; mirror it on the client
        // so the button locks immediately without a refresh.
        setLastResumeAt(new Date().toISOString());
      } else if (result.status === "error") {
        if (result.reason === "cooldown" && result.nextAvailableAt) {
          // Server cooldown won — pull the cooldown into local state.
          setLastResumeAt(
            new Date(
              new Date(result.nextAvailableAt).getTime() -
                7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          );
        }
        setError(result.message);
      }
    });
  }

  function handleClick() {
    if (locked) {
      setTooltipOpen((v) => !v);
      return;
    }
    if (!hasCompletedTasks) {
      setConfirmingEmpty(true);
      return;
    }
    runGeneration();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-disabled={locked}
        aria-busy={pending}
        title={
          locked
            ? `Available again in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
            : undefined
        }
        className={`
          inline-flex items-center gap-1.5 min-h-[32px] px-3
          border text-[11px] tracking-[0.04em] font-medium
          transition-colors duration-200 ease-out
          disabled:cursor-wait
          ${locked
            ? "bg-ink/10 text-ink/45 border-ink/15 hover:bg-ink/15 cursor-default"
            : "bg-oxblood text-cream border-oxblood hover:bg-oxblood-hover"
          }
        `}
      >
        {locked ? (
          <Lock size={11} strokeWidth={1.8} aria-hidden />
        ) : (
          <Download size={11} strokeWidth={1.8} aria-hidden />
        )}
        {pending ? "Generating…" : "Convert to resume"}
        {locked && (
          <span className="ml-1 text-[10px] tabular-nums opacity-70">
            {daysLeft}d
          </span>
        )}
      </button>

      {/* Locked tooltip */}
      {locked && tooltipOpen && (
        <div
          role="status"
          className="
            absolute right-0 top-full mt-2 z-50
            max-w-[260px] p-3
            bg-cream border border-ink/20 text-[11px] leading-[1.55] text-ink
            shadow-sm
          "
        >
          You can generate a new resume in {daysLeft} day
          {daysLeft === 1 ? "" : "s"}. We limit this to keep your resume
          reflective of substantial RuneShips activity.
          <button
            type="button"
            onClick={() => setTooltipOpen(false)}
            className="block mt-2 text-[10px] text-muted hover:text-ink underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty-resume confirmation */}
      {confirmingEmpty && (
        <div
          role="dialog"
          aria-label="Confirm empty resume"
          className="
            absolute right-0 top-full mt-2 z-50
            w-[320px] p-4
            bg-cream border border-ink/25
            shadow-sm
          "
        >
          <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
            No tasks yet
          </p>
          <p className="mt-2 text-[12px] leading-[1.55] text-ink">
            You haven&rsquo;t completed any tasks — your resume will be
            mostly empty. Generating now counts toward your weekly limit.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmingEmpty(false);
                runGeneration();
              }}
              className="
                inline-flex items-center min-h-[32px] px-3
                bg-oxblood text-cream border border-oxblood
                text-[11px] tracking-[0.04em]
                hover:bg-oxblood-hover
              "
            >
              Generate anyway
            </button>
            <button
              type="button"
              onClick={() => setConfirmingEmpty(false)}
              className="text-[11px] text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="
            absolute right-0 top-full mt-2 z-50
            w-[300px] p-3.5
            bg-cream border border-oxblood/40
            shadow-sm
          "
        >
          <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
            Resume downloaded
          </p>
          <p className="mt-2 text-[12px] leading-[1.55] text-ink">
            Verification code: <span className="font-mono">{success.code}</span>
          </p>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="block mt-2 text-[10px] text-muted hover:text-ink underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error */}
      {error && !success && (
        <div
          role="alert"
          className="
            absolute right-0 top-full mt-2 z-50
            w-[300px] p-3.5
            bg-cream border border-oxblood
            shadow-sm
          "
        >
          <p className="text-[12px] leading-[1.55] text-oxblood">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="block mt-2 text-[10px] text-muted hover:text-ink underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function triggerDownload(base64: string, filename: string): void {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Free the object URL after the click handler has a chance to fire.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
