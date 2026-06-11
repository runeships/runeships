"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase-browser";
import { signOut } from "@/app/actions/signOut";

/**
 * Shown in the sticky nav on authenticated app routes. Displays the
 * user's first name (or email fallback) next to a sign-out link that
 * calls the server-side signOut action.
 *
 * Fetches the profile lazily on mount — no name appears until the
 * round-trip completes, which keeps the nav skeleton-free without a
 * loading spinner.
 */
export function UserMenu() {
  const [label, setLabel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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

      const first = profile?.full_name?.trim().split(/\s+/)[0];
      setLabel(first || user.email || null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      {label && (
        <span className="text-[13px] tracking-[0.005em] text-muted">
          {label}
        </span>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => signOut())}
        className="
          link-anim text-[13px] tracking-[0.005em] text-ink
          hover:text-oxblood transition-colors duration-200 ease-out
          disabled:opacity-60
          focus-visible:outline-none focus-visible:text-oxblood
        "
      >
        {isPending ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
