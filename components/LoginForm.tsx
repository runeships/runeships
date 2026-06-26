"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Reveal } from "./Reveal";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; email: string }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// sessionStorage key for the last email a visitor tried. Survives a
// magic-link redirect bounce (within the same tab), so callback errors
// can land the visitor back on /login with the input prefilled.
const STORAGE_KEY = "runeships:last_email";

type LoginFormProps = {
  /** ?next= query value resolved by the server page. Default /dashboard. */
  next: string;
  /** ?error= query value resolved by the server page. null when absent. */
  initialError: string | null;
};

/**
 * Client form for /login. Receives the query params as props from the
 * server page so we don't need `useSearchParams()` + Suspense — that
 * combo was leaving visitors stuck on the static-shell fallback when
 * hydration was slow or blocked.
 */
export function LoginForm({ next, initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const callbackErrorMessage =
    state.kind === "error" ? null : callbackErrorMessageFor(initialError);

  // On mount, prefill the email input from sessionStorage so a visitor
  // bounced back here by a failed callback doesn't have to retype.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setEmail(stored);
    } catch {
      // sessionStorage can throw in privacy mode — safe to ignore.
    }
  }, []);

  async function sendMagicLink(emailToSend: string): Promise<{ ok: boolean }> {
    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const callback = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: emailToSend,
      options: { emailRedirectTo: callback },
    });

    if (error) {
      console.error("[signInWithOtp]", error);
      return { ok: false };
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, emailToSend);
    } catch {
      // ignore
    }

    return { ok: true };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setState({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    setState({ kind: "submitting" });
    const { ok } = await sendMagicLink(trimmed);

    if (!ok) {
      setState({
        kind: "error",
        message: "Couldn’t send the link. Check the email and try again.",
      });
      return;
    }

    setState({ kind: "success", email: trimmed });
  }

  async function handleResend() {
    if (state.kind !== "success") return;
    setIsResending(true);
    setResendError(null);
    const { ok } = await sendMagicLink(state.email);
    setIsResending(false);
    if (!ok) {
      setResendError(
        "Couldn’t send another link. Try again or use a different email.",
      );
    }
  }

  function resetForDifferentEmail() {
    setEmail("");
    setResendError(null);
    setState({ kind: "idle" });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const pending = state.kind === "submitting";

  if (state.kind === "success") {
    return (
      <Reveal mode="load" delay={0.05} className="mt-12">
        <div className="pl-6 sm:pl-8 border-l-2 border-oxblood max-w-[46ch]">
          <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
            Check your inbox
          </p>
          <p className="mt-3 text-[17px] leading-[1.55] text-ink/90">
            Magic link sent to{" "}
            <span className="text-ink font-medium">{state.email}</span>. Open
            the link in the same browser you&rsquo;re using right now;
            different browsers won&rsquo;t recognize the session. Links are
            valid for 24 hours.
          </p>
          <p className="mt-5 text-[14px] leading-[1.6] text-muted">
            Didn&rsquo;t get it? Check spam, or{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              aria-busy={isResending}
              className={`
                link-anim text-ink
                hover:text-oxblood focus-visible:text-oxblood
                transition-colors duration-200 ease-out
                focus-visible:outline-none
                disabled:cursor-not-allowed
                ${isResending ? "btn-pulse" : ""}
              `}
            >
              {isResending ? "resending…" : "resend magic link"}
            </button>
            .
          </p>
          {resendError && (
            <p role="alert" className="mt-2 text-[13px] text-oxblood">
              {resendError}
            </p>
          )}
          <p className="mt-4 text-[13px] tracking-[0.005em] text-muted">
            <button
              type="button"
              onClick={resetForDifferentEmail}
              className="
                link-anim text-muted hover:text-ink
                transition-colors duration-200 ease-out
                focus-visible:outline-none focus-visible:text-ink
              "
            >
              Use a different email
            </button>
          </p>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal mode="load" delay={0.30} className="mt-10 sm:mt-12">
      {callbackErrorMessage && (
        <p
          role="alert"
          className="mb-6 pl-5 border-l-2 border-oxblood text-[14px] leading-[1.55] text-oxblood max-w-[42ch]"
        >
          {callbackErrorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email" className="sr-only">
          Email address
        </label>
        <div className="flex flex-col sm:flex-row">
          <input
            id="login-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            aria-invalid={state.kind === "error"}
            aria-describedby={
              state.kind === "error" ? "login-email-error" : undefined
            }
            className="
              flex-1 min-h-[56px] px-5
              border border-ink/25 bg-cream text-ink placeholder:text-muted
              text-[16px] tracking-[-0.005em]
              outline-none
              transition-colors duration-150 ease-out
              focus:border-oxblood focus:ring-1 focus:ring-oxblood
              disabled:opacity-60
              sm:border-r-0
            "
          />
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className={`
              min-h-[56px] px-7
              bg-oxblood text-cream
              border border-oxblood
              text-[15px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              disabled:cursor-not-allowed
              mt-3 sm:mt-0
              ${pending ? "btn-pulse" : ""}
            `}
          >
            {pending ? "Sending…" : "Send magic link"}
          </button>
        </div>

        {state.kind === "error" && (
          <p
            id="login-email-error"
            role="alert"
            className="mt-3 text-[14px] leading-snug text-oxblood"
          >
            {state.message}
          </p>
        )}
      </form>
    </Reveal>
  );
}

/**
 * Maps the ?error=... query param the callback route appends to the
 * user-facing message. null when there's no error to show.
 */
function callbackErrorMessageFor(code: string | null): string | null {
  switch (code) {
    case "expired":
      return "This link expired. Magic links last 24 hours. Send a fresh one below.";
    case "already_used":
      return "This link was already used. Send a fresh one to sign in again.";
    case "browser_mismatch":
      return "Looks like you opened the link in a different browser than where you requested it. Try again, and request the link AND open the email in the same browser.";
    case null:
    case "":
      return null;
    case "invalid_link":
    default:
      return "Couldn’t sign you in. Send a fresh link below.";
  }
}
