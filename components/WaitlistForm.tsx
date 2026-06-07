"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions";

const initial: WaitlistState = { status: "idle" };

type WaitlistFormProps = {
  /** Which surface produced the signup — stored on the row for funnel analysis. */
  source?: string;
  /** Suffix for the input id so multiple instances don't collide. */
  id?: string;
  /** Light = cream-on-cream (default). Dark = inverted for the closing section. */
  variant?: "light" | "dark";
};

export function WaitlistForm({
  source = "landing_hero",
  id = "hero",
  variant = "light",
}: WaitlistFormProps) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initial);
  const inputId = `waitlist-email-${id}`;
  const errorId = `waitlist-email-${id}-error`;
  const dark = variant === "dark";

  if (state.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className={`max-w-[34rem] text-[16px] leading-[1.55] ${
          dark ? "text-cream/85" : "text-ink/85"
        }`}
      >
        On the list. We&rsquo;ll write as soon as access opens — keep an eye on your inbox.
      </p>
    );
  }

  const hasError = state.status === "error";

  const inputClass = dark
    ? "border border-cream/40 bg-transparent text-cream placeholder:text-cream/55 focus:border-cream focus:ring-cream/60"
    : "border border-ink/25 bg-cream text-ink placeholder:text-muted focus:border-oxblood focus:ring-oxblood";

  return (
    <form action={formAction} noValidate className="max-w-[34rem]">
      <input type="hidden" name="source" value={source} />
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col sm:flex-row">
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@school.edu"
          disabled={pending}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={`
            flex-1 min-h-[56px] px-5
            text-[16px] tracking-[-0.005em]
            outline-none
            disabled:opacity-60
            sm:border-r-0
            ${inputClass}
          `}
        />
        <button
          type="submit"
          disabled={pending}
          className="
            min-h-[56px] px-7
            bg-oxblood text-cream
            border border-oxblood
            text-[15px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
            disabled:opacity-60 disabled:cursor-not-allowed
            mt-3 sm:mt-0
          "
        >
          {pending ? "Adding…" : "Get early access"}
        </button>
      </div>
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className={`mt-3 text-[14px] leading-snug ${
            dark ? "text-cream" : "text-oxblood"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
