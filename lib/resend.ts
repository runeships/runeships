import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Server-only Resend client. Null when no API key is configured so
 * actions can fall back gracefully — the user-facing flow should never
 * fail because email is misconfigured.
 *
 * Sending from `hello@runeships.com` — domain verified at
 * resend.com/domains. If you ever revoke verification, swap back to the
 * sandbox `onboarding@resend.dev` (only delivers to account owner).
 */
export const resend = apiKey ? new Resend(apiKey) : null;

export const RESEND_FROM = "RuneShips <hello@runeships.com>";
