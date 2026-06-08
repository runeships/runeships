import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Server-only Resend client. Null when no API key is configured so
 * actions can fall back gracefully — the user-facing flow should never
 * fail because email is misconfigured.
 *
 * Note on `from`: until runeships.com is verified at resend.com/domains,
 * we send from the sandbox `onboarding@resend.dev` address. Sandbox
 * sends only deliver to the account owner's verified email. Production
 * delivery to arbitrary recipients requires domain verification.
 */
export const resend = apiKey ? new Resend(apiKey) : null;

export const RESEND_FROM = "RuneShips <onboarding@resend.dev>";
