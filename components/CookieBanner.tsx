"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "runeships:cookie-consent";

/**
 * Cookie consent banner. Shows once per browser (until localStorage
 * is cleared), at the bottom of every page.
 *
 * Defers showing until after the hydration check, so the banner
 * never flashes for users who've already accepted. Uses localStorage
 * directly rather than a cookie — the banner is about behavior
 * notification, not consent collection for analytics that need a
 * server-readable flag.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      if (!existing) setShow(true);
    } catch {
      // Private mode or storage blocked — fail closed and don't show
      // the banner. Better than throwing.
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore — same story as above
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-[calc(100%-48px)] max-w-[720px]
        border border-oxblood bg-cream
        rounded-[2px]
        p-5
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <p className="text-[13px] leading-[1.55] text-ink/85 flex-1">
          We use a small set of cookies to keep you signed in and remember
          your preferences. Nothing tracking, nothing shared with advertisers.{" "}
          <Link
            href="/cookies"
            className="link-anim text-oxblood underline underline-offset-2 hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            Read more
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={accept}
            className="
              inline-flex items-center min-h-[40px] px-5
              bg-oxblood text-cream border border-oxblood
              text-[13px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
            "
          >
            Accept
          </button>
          <Link
            href="/cookies"
            className="
              inline-flex items-center min-h-[40px] px-4
              bg-transparent text-ink border border-ink/30
              text-[13px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:border-ink hover:text-ink
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
            "
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
}
