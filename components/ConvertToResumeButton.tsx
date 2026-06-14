"use client";

import { useState, useTransition } from "react";
import { FileText, Check, Copy } from "lucide-react";
import { generateCvBullet } from "@/app/actions/generateResume";

/** "Get CV bullet" — student-only StickyNav button.
 *  Click → generate (or refresh) a 2-sentence snippet they can
 *  paste into their existing CV. Includes a verification URL so
 *  recruiters can confirm the standing. No PDF. No cooldown. */
export function ConvertToResumeButton() {
  const [pending, startTransition] = useTransition();
  const [snippet, setSnippet] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClick() {
    if (snippet) {
      // Already open — clicking again closes the popover.
      setSnippet(null);
      setCode(null);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await generateCvBullet();
      if (result.status === "success") {
        setSnippet(result.bullet);
        setCode(result.resumeCode);
      } else if (result.status === "error") {
        setError(result.message);
      }
    });
  }

  async function copyToClipboard() {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers / locked-down environments: fall through
      // to a textarea + execCommand fallback would go here. For
      // now leave it silent — the user can select+copy manually.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-busy={pending}
        aria-expanded={snippet !== null}
        className="
          inline-flex items-center gap-1.5 min-h-[32px] px-3
          bg-oxblood text-cream border border-oxblood
          text-[11px] tracking-[0.04em] font-medium
          transition-colors duration-200 ease-out
          hover:bg-oxblood-hover
          disabled:cursor-wait disabled:opacity-70
        "
      >
        <FileText size={11} strokeWidth={1.8} aria-hidden />
        {pending ? "Generating…" : "Get CV bullet"}
      </button>

      {snippet && (
        <div
          role="dialog"
          aria-label="CV bullet"
          className="
            absolute right-0 top-full mt-2 z-50
            w-[360px] p-4
            bg-cream border border-ink/25 shadow-sm
          "
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
              CV bullet
            </p>
            {code && (
              <p className="text-[10px] text-muted font-mono">{code}</p>
            )}
          </div>
          <p className="mt-3 text-[13px] leading-[1.55] text-ink whitespace-pre-wrap">
            {snippet}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={copyToClipboard}
              className="
                inline-flex items-center gap-1.5 min-h-[32px] px-3
                bg-oxblood text-cream border border-oxblood
                text-[11px] tracking-[0.04em]
                hover:bg-oxblood-hover transition-colors duration-200 ease-out
              "
            >
              {copied ? (
                <>
                  <Check size={11} strokeWidth={1.8} aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={11} strokeWidth={1.8} aria-hidden />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setSnippet(null);
                setCode(null);
              }}
              className="text-[11px] text-muted hover:text-ink transition-colors duration-200 ease-out"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && !snippet && (
        <div
          role="alert"
          className="
            absolute right-0 top-full mt-2 z-50
            w-[300px] p-3.5
            bg-cream border border-oxblood shadow-sm
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
