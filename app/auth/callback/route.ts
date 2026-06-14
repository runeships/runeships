import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * Magic-link callback. Supabase Auth redirects here with `?code=` after
 * the user clicks the email link. We exchange the code for a session,
 * then route the user based on their onboarding state:
 *
 *   - profile.onboarding_completed === false  → /onboarding
 *   - profile.onboarding_completed === true   → ?next= (default /dashboard)
 *   - exchange error                          → /login?error=<specific>
 *
 * The error code is mapped from the Supabase auth error so the /login
 * page can show a specific recovery hint (expired link / already used /
 * different browser / generic).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code,
  );
  if (exchangeError) {
    console.error("[auth callback exchange]", exchangeError);
    const errorCode = mapAuthError(exchangeError);
    return NextResponse.redirect(`${origin}/login?error=${errorCode}`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, account_type, company_id")
    .eq("id", user.id)
    .maybeSingle();

  // Brand-new signup: no profile row yet or no account_type chosen.
  // Send them to the type-selection screen.
  if (!profile) {
    return NextResponse.redirect(`${origin}/onboarding/select-type`);
  }

  // Company side: route to /companies/dashboard once they finish the
  // company onboarding step (which sets company_id). Otherwise back
  // to the company onboarding form.
  if (profile.account_type === "company") {
    const target = profile.company_id
      ? "/companies/dashboard"
      : "/onboarding/company";
    return NextResponse.redirect(`${origin}${target}`);
  }

  // Student side: existing behavior.
  if (profile.onboarding_completed === false) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Preserve the original intended destination if any.
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}

/**
 * Map a Supabase auth error into one of our four user-facing codes.
 * Checks both the structured `code` field (newer supabase-js) and the
 * message text (older versions and edge cases).
 *
 *   expired           → the OTP / magic link itself has expired
 *   already_used      → the code was already exchanged once
 *   browser_mismatch  → PKCE flow_state isn't recognized in this browser
 *   invalid_link      → catch-all for anything we couldn't classify
 */
function mapAuthError(error: { code?: string; message?: string }): string {
  const code = (error.code ?? "").toLowerCase();
  const message = (error.message ?? "").toLowerCase();

  // OTP expired — the email itself is too old.
  if (
    code === "otp_expired" ||
    code === "email_otp_expired" ||
    /\botp[_ ]expired\b|\blink (has )?expired\b|token (is )?expired/.test(message)
  ) {
    return "expired";
  }

  // PKCE flow state can't be found / verified → user opened the link
  // in a different browser than where they requested it.
  if (
    code === "flow_state_not_found" ||
    code === "flow_state_expired" ||
    code === "bad_code_verifier" ||
    code === "pkce_invalid_grant" ||
    code === "invalid_request" ||
    /\bpkce\b|code verifier|flow state/.test(message)
  ) {
    return "browser_mismatch";
  }

  // The code was already exchanged (e.g. clicked the link twice, or
  // an email scanner pre-fetched the URL and consumed the token).
  if (
    code === "invalid_grant" ||
    code === "otp_disabled" ||
    code === "invalid_credentials" ||
    /\balready (used|consumed|redeemed)\b|invalid login credentials/.test(message)
  ) {
    return "already_used";
  }

  return "invalid_link";
}
