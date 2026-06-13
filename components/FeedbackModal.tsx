"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase-browser";
import { sendFeedback } from "@/app/actions/sendFeedback";

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "bug", label: "Bug or issue" },
  { value: "suggestion", label: "Suggestion" },
  { value: "praise", label: "Praise / what's working" },
  { value: "question", label: "Question" },
  { value: "other", label: "Other" },
];

const MAX_LENGTH = 2000;
const SUCCESS_AUTO_CLOSE_MS = 3000;

type Stage = "idle" | "submitting" | "success" | "error";

type Identity = { name: string; email: string } | null;

/**
 * Send-feedback modal. Renders into document.body via portal so it
 * escapes any parent overflow/position chains (the trigger commonly
 * lives inside a <p> caption).
 *
 * State machine: idle → submitting → success | error. Success
 * replaces the form with a "thanks" panel and auto-closes after 3s.
 * Error renders an inline note above the buttons; the form stays
 * intact for retry.
 *
 * Keyboard: ESC closes (unless submitting). Cmd/Ctrl+Enter inside
 * the textarea sends. Tab traps focus inside the panel.
 */
export function FeedbackModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [category, setCategory] = useState("suggestion");
  const [feedback, setFeedback] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [identity, setIdentity] = useState<Identity>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // ─── Reset on close ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      // Defer the reset slightly so the close animation has a frame
      // to render before the form clears.
      const t = window.setTimeout(() => {
        setStage("idle");
        setErrorMsg(null);
        setFeedback("");
        setCategory("suggestion");
      }, 150);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // ─── Identity preview (transparency line) ────────────────────
  useEffect(() => {
    if (!isOpen || identity) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setIdentity({
        name: profile?.full_name?.trim() || "(unnamed student)",
        email: user.email ?? "",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, identity]);

  // ─── Body scroll lock ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ─── ESC + focus trap ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    // Initial focus → first focusable element.
    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables[0]?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = panel!.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, pending]);

  // ─── Auto-close after success ───────────────────────────────
  useEffect(() => {
    if (stage !== "success") return;
    const t = window.setTimeout(() => onClose(), SUCCESS_AUTO_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [stage, onClose]);

  // ─── Submit ─────────────────────────────────────────────────
  const submit = useCallback(() => {
    const trimmed = feedback.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) return;
    setErrorMsg(null);
    setStage("submitting");
    startTransition(async () => {
      const pageUrl =
        typeof window !== "undefined" ? window.location.href : "(unknown)";
      const result = await sendFeedback({
        category,
        feedback: trimmed,
        pageUrl,
      });
      if (result.success) {
        setStage("success");
      } else {
        setStage("error");
        setErrorMsg(result.error);
      }
    });
  }, [category, feedback]);

  // ─── Cmd/Ctrl+Enter from textarea submits ────────────────────
  const handleTextareaKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  if (!mounted || !isOpen) return null;

  const remaining = MAX_LENGTH - feedback.length;
  const counterLow = remaining < 100;
  const canSubmit = feedback.trim().length > 0 && !pending;
  const isSuccess = stage === "success";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      onClick={onClose}
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-ink/50
        p-4
      "
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="
          w-[90%] max-w-[480px]
          bg-cream
          border-[1.5px] border-oxblood
          rounded-[2px]
          p-8
        "
      >
        {isSuccess ? (
          <SuccessPanel onClose={onClose} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <h2
              id="feedback-modal-title"
              className="font-display font-light text-[24px] leading-[1.15] tracking-[-0.014em] text-ink"
            >
              Send feedback
            </h2>
            <p className="mt-2 font-display italic text-[14px] leading-[1.55] text-muted">
              Tell us what&rsquo;s working, what&rsquo;s broken, or what you
              wish RuneShips did better. We read everything.
            </p>
            <hr className="mt-5 border-0 border-t border-ink/10" />

            {/* Category */}
            <div className="mt-6">
              <label
                htmlFor="feedback-category"
                className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
              >
                Category
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={pending}
                className="
                  w-full min-h-[44px] px-3
                  border border-ink/25 bg-cream text-ink
                  text-[14px] tracking-[-0.005em]
                  outline-none cursor-pointer
                  transition-colors duration-150 ease-out
                  focus:border-oxblood focus:ring-1 focus:ring-oxblood
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div className="mt-5">
              <label
                htmlFor="feedback-message"
                className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
              >
                Your message
              </label>
              <textarea
                id="feedback-message"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={handleTextareaKey}
                rows={5}
                maxLength={MAX_LENGTH}
                placeholder="What's on your mind?"
                disabled={pending}
                className="
                  w-full px-3 py-2.5
                  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
                  text-[14px] leading-[1.6]
                  outline-none resize-y
                  transition-colors duration-150 ease-out
                  focus:border-oxblood focus:ring-1 focus:ring-oxblood
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
              <p
                className={`mt-1.5 text-right text-[11px] tabular-nums ${counterLow ? "text-oxblood" : "text-muted"}`}
              >
                {remaining}/{MAX_LENGTH}
              </p>
            </div>

            {/* Sender note */}
            {identity && (
              <p className="mt-4 text-[12px] leading-[1.5] text-muted">
                Sending as{" "}
                <span className="text-ink">{identity.name}</span>
                {identity.email && (
                  <> ({identity.email})</>
                )}
              </p>
            )}

            {/* Inline error */}
            {errorMsg && (
              <p
                role="alert"
                className="mt-4 text-[13px] leading-[1.5] text-oxblood"
              >
                {errorMsg}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="
                  text-[14px] tracking-[0.005em] text-muted
                  link-anim hover:text-oxblood
                  transition-colors duration-200 ease-out
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                aria-busy={pending}
                className={`
                  inline-flex items-center
                  min-h-[44px] px-6
                  bg-oxblood text-cream border border-oxblood
                  text-[14px] tracking-[0.01em] font-medium
                  transition-colors duration-200 ease-out
                  hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${pending ? "btn-pulse" : ""}
                `}
              >
                {pending ? "Sending…" : "Send feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

function SuccessPanel({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <h2
        className="font-display font-light text-[24px] leading-[1.15] tracking-[-0.014em] text-ink"
      >
        Thanks for the feedback.
      </h2>
      <p className="mt-3 text-[14px] leading-[1.6] text-muted">
        We&rsquo;ve sent your message to the team. We read every one.
      </p>
      <div className="mt-7 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="
            inline-flex items-center
            min-h-[44px] px-6
            bg-oxblood text-cream border border-oxblood
            text-[14px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}
