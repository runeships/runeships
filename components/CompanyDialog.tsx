"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  submitCompanyLead,
  type CompanyLeadState,
} from "@/app/actions/submitCompanyLead";

const initial: CompanyLeadState = { status: "idle" };

/**
 * "Talk to us" trigger + native <dialog> with a server-action form.
 *
 * The native <dialog> gives us focus trap, ESC-to-close, and inert
 * backdrop for free. We add: explicit center positioning (Tailwind's
 * preflight kills the user-agent margin:auto default), click-outside-
 * to-close, auto-focus on the first field on open, and a subtle
 * fade+lift entrance animation defined in globals.css.
 *
 * On submission success we fire a toast and auto-close after 2s.
 */
export function CompanyDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(
    submitCompanyLead,
    initial,
  );

  // Success → toast + auto-close
  useEffect(() => {
    if (state.status !== "success") return;
    window.dispatchEvent(
      new CustomEvent("runeships:toast", {
        detail: { text: "Thanks — we'll be in touch within 48 hours." },
      }),
    );
    const t = window.setTimeout(() => dialogRef.current?.close(), 2000);
    return () => window.clearTimeout(t);
  }, [state.status]);

  function open() {
    const dlg = dialogRef.current;
    if (!dlg) return;
    dlg.showModal();
    // Focus the first non-hidden input after the dialog enters the DOM.
    requestAnimationFrame(() => {
      const firstInput = dlg.querySelector<HTMLInputElement>(
        "input:not([type='hidden'])",
      );
      firstInput?.focus();
    });
  }

  function close() {
    dialogRef.current?.close();
  }

  // Click-outside-to-close: the click target is the <dialog> itself
  // (its backdrop area) only when the user clicks outside the panel.
  function onDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="
          inline-flex items-center
          min-h-[56px] px-7
          bg-oxblood text-cream
          border border-oxblood
          text-[15px] tracking-[0.01em] font-medium
          transition-colors duration-200 ease-out
          hover:bg-oxblood-hover
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
        "
      >
        Talk to us
      </button>

      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-labelledby="company-dialog-title"
        className="
          company-dialog
          w-[min(560px,calc(100vw-2rem))]
          max-h-[min(calc(100dvh-2rem),760px)]
          overflow-y-auto
          p-0 m-0 border-0
          bg-cream text-ink
          backdrop:bg-ink/60
        "
      >
        {/* The panel — top oxblood accent rule and rounded scroll surface */}
        <div className="border-t-[3px] border-oxblood">
          {/* ─── Header ─────────────────────────────────────────────── */}
          <header className="px-8 sm:px-10 pt-9 sm:pt-10 pb-7 flex items-start justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted mb-3">
                For companies
              </p>
              <h2
                id="company-dialog-title"
                className="font-display font-normal text-[26px] sm:text-[30px] leading-[1.1] tracking-[-0.016em] max-w-[22ch] text-ink"
              >
                Tell us what tasks you&rsquo;d post.
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close dialog"
              className="
                shrink-0 -mr-2 -mt-2
                w-9 h-9 rounded-full
                inline-flex items-center justify-center
                text-muted
                transition-colors duration-200 ease-out
                hover:text-ink hover:bg-ink/[0.04]
                focus-visible:outline-none focus-visible:text-ink focus-visible:bg-ink/[0.04]
              "
            >
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M3 3 L11 11 M11 3 L3 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          {/* ─── Body ───────────────────────────────────────────────── */}
          {state.status === "success" ? (
            <div className="px-8 sm:px-10 pb-10">
              <p className="text-[16px] leading-[1.55] text-ink/85 max-w-[44ch]">
                Thanks — we&rsquo;ll be in touch within 48 hours.
              </p>
            </div>
          ) : (
            <form action={formAction} noValidate>
              <div className="px-8 sm:px-10 pb-2 space-y-6">
                <Field
                  id="cd-name"
                  name="name"
                  label="Your name"
                  type="text"
                  autoComplete="name"
                  disabled={pending}
                  required
                />
                <Field
                  id="cd-email"
                  name="email"
                  label="Work email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  disabled={pending}
                  required
                />
                <Field
                  id="cd-company"
                  name="company_name"
                  label="Company"
                  type="text"
                  autoComplete="organization"
                  disabled={pending}
                  required
                />

                <div>
                  <label
                    htmlFor="cd-tasks"
                    className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5"
                  >
                    What tasks would you post?
                  </label>
                  <textarea
                    id="cd-tasks"
                    name="task_description"
                    rows={4}
                    disabled={pending}
                    placeholder="A short sketch — what work, what skills, what you'd want to see."
                    className="
                      w-full px-4 py-3
                      bg-cream text-ink placeholder:text-muted/80
                      border border-ink/20
                      text-[15px] leading-[1.55]
                      outline-none resize-y
                      transition-colors duration-150 ease-out
                      focus:border-oxblood focus:ring-1 focus:ring-oxblood
                      disabled:opacity-60
                    "
                  />
                </div>

                {state.status === "error" && (
                  <p
                    role="alert"
                    className="text-[14px] leading-snug text-oxblood"
                  >
                    {state.message}
                  </p>
                )}
              </div>

              {/* ─── Footer ─────────────────────────────────────────── */}
              <div className="mt-8 px-8 sm:px-10 py-5 border-t border-rule flex items-center justify-between gap-5">
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="
                    link-anim text-[14px] tracking-[0.005em] text-muted
                    hover:text-ink transition-colors duration-200 ease-out
                    focus-visible:outline-none focus-visible:text-ink
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending}
                  className={`
                    min-h-[48px] px-8
                    bg-oxblood text-cream
                    border border-oxblood
                    text-[15px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                    disabled:cursor-not-allowed
                    ${pending ? "btn-pulse" : ""}
                  `}
                >
                  {pending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email";
  autoComplete?: string;
  inputMode?: "email" | "text";
  required?: boolean;
  disabled?: boolean;
};

function Field({
  id,
  name,
  label,
  type,
  autoComplete,
  inputMode,
  required,
  disabled,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        disabled={disabled}
        className="
          w-full min-h-[48px] px-4
          bg-cream text-ink placeholder:text-muted/80
          border border-ink/20
          text-[15px]
          outline-none
          transition-colors duration-150 ease-out
          focus:border-oxblood focus:ring-1 focus:ring-oxblood
          disabled:opacity-60
        "
      />
    </div>
  );
}
