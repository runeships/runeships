"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  hasCookieConsent,
  setCookieConsent,
} from "@/lib/cookieConsent";

/**
 * Cookie consent banner. Shows once per browser until the user
 * acknowledges it. Backed by a first-party cookie
 * (runeships_cookie_consent) with a 12-month expiry — matches the
 * name disclosed in /cookies and respects standard browser controls
 * (Clear cookies for this site brings the banner back).
 *
 * Mount-effect defers showing the banner until after hydration so
 * it never flashes for users who've already accepted.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasCookieConsent()) setShow(true);
  }, []);

  function accept() {
    setCookieConsent();
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
        <div className="flex-1">
          <p className="text-[13px] leading-[1.55] text-ink/85">
            RuneShips uses essential cookies to keep you signed in and to
            protect your session. We don&rsquo;t use advertising, tracking,
            or third-party analytics cookies.{" "}
            <Link
              href="/cookies"
              className="link-anim text-oxblood underline underline-offset-2 hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              Read more
            </Link>
            .
          </p>
          <p className="mt-2 text-[11px] leading-[1.55] text-muted">
            Prefer not to use cookies at all? You can browse our marketing
            pages without signing in.
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="
            inline-flex items-center min-h-[40px] px-5 shrink-0
            bg-oxblood text-cream border border-oxblood
            text-[13px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
          "
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}
