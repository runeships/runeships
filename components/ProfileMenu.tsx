"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { signOut } from "@/app/actions/signOut";

function initialsFrom(name: string | null | undefined): string {
  if (!name) return "•";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  const combined = (first + last).toUpperCase();
  return combined || "•";
}

/**
 * Avatar button in StickyNav that opens a small dropdown menu:
 * "Profile" → /profile, "Sign out" → signOut action.
 *
 * The profile lookup mirrors the old UserMenu — lazy fetch on mount
 * so the nav stays skeleton-free if the request is slow.
 */
export function ProfileMenu() {
  const [initials, setInitials] = useState<string>("•");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

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
      setInitials(initialsFrom(profile?.full_name));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Click-outside-to-close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="
          w-9 h-9 rounded-full
          inline-flex items-center justify-center
          border border-oxblood bg-parchment
          font-display text-[13px] tracking-[0.04em] text-oxblood
          transition-colors duration-200 ease-out
          hover:bg-oxblood hover:text-cream
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
        "
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="
            absolute right-0 top-full mt-2 w-[200px]
            border border-ink/20 bg-cream
            divide-y divide-ink/10
            z-50
          "
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="
              flex items-center gap-3 px-4 py-3
              text-[14px] tracking-[-0.005em] text-ink
              transition-colors duration-200 ease-out
              hover:bg-parchment hover:text-oxblood
              focus-visible:outline-none focus-visible:bg-parchment focus-visible:text-oxblood
            "
          >
            <User aria-hidden size={16} strokeWidth={1.6} />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                setOpen(false);
                signOut();
              })
            }
            className="
              w-full flex items-center gap-3 px-4 py-3
              text-[14px] tracking-[-0.005em] text-ink text-left
              transition-colors duration-200 ease-out
              hover:bg-parchment hover:text-oxblood
              focus-visible:outline-none focus-visible:bg-parchment focus-visible:text-oxblood
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <LogOut aria-hidden size={16} strokeWidth={1.6} />
            {isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
