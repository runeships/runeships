"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  submitCompanyLead,
  type CompanyLeadState,
} from "@/app/actions/submitCompanyLead";

const initial: CompanyLeadState = { status: "idle" };

/**
 * Outline CTA + native <dialog> with a single form. Uses the platform
 * dialog element for focus trap, ESC-to-close, click-outside-to-close,
 * and inert background — no extra dependencies, no shadow.
 *
 * On success: dispatches a `runeships:toast` event so the global Toast
 * component can show the confirmation at the bottom of the screen, then
 * closes the modal after 2s.
 */
export function CompanyDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(
    submitCompanyLead,
    initial,
  );

  // On success: fire the global toast and close after 2s.
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
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  // Click-outside-to-close: native <dialog> supports this with a
  // backdrop click. We detect it by checking that the click target is
  // the dialog element itself (not a descendant).
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
          bg-cream text-ink
          w-[min(560px,calc(100vw-2rem))]
          p-0
          border-0
          backdrop:bg-ink/55
        "
      >
        <div className="border-t-4 border-oxblood">
          <div className="flex items-start justify-between px-6 sm:px-9 pt-7 pb-2">
            <h2
              id="company-dialog-title"
              className="font-display text-[28px] sm:text-[32px] leading-[1.1] tracking-[-0.015em] max-w-[22ch]"
            >
              Tell us what tasks you&rsquo;d post.
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close dialog"
              className="
                shrink-0 -mr-1 -mt-1 min-h-[44px] min-w-[44px]
                inline-flex items-center justify-center
                text-ink hover:text-oxblood
                transition-colors duration-200 ease-out
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              "
            >
              <span aria-hidden className="text-[22px] leading-none">×</span>
            </button>
          </div>

          {state.status === "success" ? (
            <div className="px-6 sm:px-9 pb-9 pt-2">
              <p className="text-[16px] leading-[1.55] text-ink/85 max-w-[42ch]">
                Thanks — we&rsquo;ll be in touch within 48 hours.
              </p>
            </div>
          ) : (
            <form
              action={formAction}
              noValidate
              className="px-6 sm:px-9 pb-9 pt-2"
            >
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

              <div className="mt-5">
                <label
                  htmlFor="cd-tasks"
                  className="block text-[13px] tracking-[0.04em] uppercase text-muted mb-2"
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
                    bg-cream text-ink placeholder:text-muted
                    border border-ink/25
                    text-[15px] leading-[1.5]
                    outline-none resize-y
                    focus:border-oxblood focus:ring-1 focus:ring-oxblood
                    disabled:opacity-60
                  "
                />
              </div>

              {state.status === "error" && (
                <p role="alert" className="mt-4 text-[14px] text-oxblood">
                  {state.message}
                </p>
              )}

              <div className="mt-7 flex items-center gap-5">
                <button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending}
                  className={`
                    min-h-[52px] px-7
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
                <button
                  type="button"
                  onClick={close}
                  disabled={pending}
                  className="
                    text-[14px] tracking-wide text-muted
                    hover:text-ink transition-colors duration-200 ease-out
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
                  "
                >
                  Cancel
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
    <div className="mt-5 first:mt-0">
      <label
        htmlFor={id}
        className="block text-[13px] tracking-[0.04em] uppercase text-muted mb-2"
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
          bg-cream text-ink placeholder:text-muted
          border border-ink/25
          text-[15px]
          outline-none
          focus:border-oxblood focus:ring-1 focus:ring-oxblood
          disabled:opacity-60
        "
      />
    </div>
  );
}
