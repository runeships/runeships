"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Reveal } from "@/components/Reveal";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; email: string }
  | { kind: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  // useSearchParams must live inside a Suspense boundary so the page
  // can prerender. Outer wrapper renders the static chrome; inner
  // component reads the query params client-side.
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[480px]">
        <h1
          className="font-display font-light tracking-[-0.022em] leading-[1] text-ink"
          style={{
            fontSize: "clamp(2.4rem, 4vw + 1rem, 3.5rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Sign in to RuneShips.
        </h1>
      </div>
    </main>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setState({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    setState({ kind: "submitting" });

    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const callback = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: callback },
    });

    if (error) {
      console.error("[signInWithOtp]", error);
      setState({
        kind: "error",
        message: "Couldn’t send the link. Check the email and try again.",
      });
      return;
    }

    setState({ kind: "success", email: trimmed });
  }

  const pending = state.kind === "submitting";

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-32 sm:pt-40 md:pt-48 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[480px]">
        <Reveal mode="load" delay={0.05}>
          <h1
            className="font-display font-light tracking-[-0.022em] leading-[1] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4vw + 1rem, 3.5rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Sign in to RuneShips.
          </h1>
        </Reveal>

        <Reveal mode="load" delay={0.18} className="mt-6">
          <p className="text-[17px] leading-[1.55] text-muted max-w-[36ch]">
            We’ll send a magic link to your email. No password needed.
          </p>
        </Reveal>

        {state.kind === "success" ? (
          <Reveal mode="load" delay={0.05} className="mt-12">
            <div className="pl-6 sm:pl-8 border-l-2 border-oxblood max-w-[40ch]">
              <p className="text-[11px] tracking-[0.16em] uppercase text-oxblood">
                Check your inbox
              </p>
              <p className="mt-3 text-[17px] leading-[1.55] text-ink/90">
                We sent a sign-in link to{" "}
                <span className="text-ink font-medium">{state.email}</span>.
                Click it to sign in. It works on any device.
              </p>
              <p className="mt-5 text-[13px] tracking-[0.005em] text-muted">
                The link expires in an hour.{" "}
                <button
                  type="button"
                  onClick={() => setState({ kind: "idle" })}
                  className="link-anim text-ink hover:text-oxblood transition-colors duration-200 ease-out"
                >
                  Wrong email?
                </button>
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal mode="load" delay={0.30} className="mt-10 sm:mt-12">
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

              {errorParam === "invalid_link" && state.kind !== "error" && (
                <p
                  role="alert"
                  className="mt-3 text-[14px] leading-snug text-oxblood"
                >
                  That sign-in link was invalid or expired. Send a fresh one.
                </p>
              )}
            </form>
          </Reveal>
        )}
      </div>
    </main>
  );
}
