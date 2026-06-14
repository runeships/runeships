/**
 * Client-side helpers for the first-party consent cookie.
 *
 * We standardized on a real cookie (not localStorage) so the consent
 * state is server-readable if we ever need that, matches the name
 * disclosed in /cookies, and respects standard browser controls
 * (Clear cookies for this site → banner returns).
 *
 * The cookie itself has no marketing value — it's a one-bit flag
 * recording that the banner was acknowledged.
 */

export const COOKIE_CONSENT_NAME = "runeships_cookie_consent";
export const COOKIE_CONSENT_VALUE = "acknowledged";
/** 12 months. */
export const COOKIE_CONSENT_MAX_AGE_S = 60 * 60 * 24 * 365;

export function hasCookieConsent(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE_CONSENT_NAME}=`));
}

export function setCookieConsent(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_CONSENT_NAME}=${COOKIE_CONSENT_VALUE}; max-age=${COOKIE_CONSENT_MAX_AGE_S}; path=/; SameSite=Lax${secure}`;
}

export function clearCookieConsent(): void {
  if (typeof document === "undefined") return;
  // max-age=0 expires it immediately; the path must match the
  // setter's path or the browser keeps the original.
  document.cookie = `${COOKIE_CONSENT_NAME}=; max-age=0; path=/; SameSite=Lax`;
}
