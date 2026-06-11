import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";

/**
 * Magic-link callback. Supabase Auth redirects here with `?code=` after
 * the user clicks the email link. We exchange the code for a session,
 * then route the user based on their onboarding state:
 *
 *   - profile.onboarding_completed === false  → /onboarding
 *   - profile.onboarding_completed === true   → ?next= (default /dashboard)
 *   - any error                               → /login?error=invalid_link
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  const supabase = await createClient();

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[auth callback exchange]", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
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
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  // Defensive: if the on_auth_user_created trigger hasn't materialized
  // the row yet, treat as onboarding-incomplete.
  if (!profile || profile.onboarding_completed === false) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Preserve the original intended destination if any.
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
