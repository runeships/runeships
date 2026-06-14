"use client";

import { clearCookieConsent } from "@/lib/cookieConsent";

/**
 * "Cookie settings" — clears the consent cookie and reloads the
 * page so the CookieBanner mount-effect re-fires and the banner
 * appears again.
 *
 * Renders as an inline button styled like the other footer links
 * (small muted text with link-anim underline). The button is the
 * right semantic element here — it doesn't navigate.
 */
export function CookieSettingsLink({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        clearCookieConsent();
        window.location.reload();
      }}
      className={
        className ??
        "link-anim hover:text-ink transition-colors duration-200 ease-out"
      }
    >
      Cookie settings
    </button>
  );
}
