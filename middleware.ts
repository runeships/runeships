import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./lib/database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Routes that require a signed-in user. Unmatched requests pass through.
 * Add new app-area roots here as they ship.
 */
const PROTECTED_ROUTES = [
  "/onboarding",
  "/dashboard",
  "/tasks",
  "/submissions",
  "/profile",
  // Company side. /companies (the marketing page) is intentionally
  // NOT in here — it's public-facing. Sub-routes under /companies/
  // require auth.
  "/companies/dashboard",
  "/companies/tasks",
  "/companies/submissions",
  // /admin/* is gated at the page level by requireAdmin(), but listing
  // it here ensures unauthenticated visitors bounce to /login at the
  // edge instead of doing a server-render → redirect roundtrip.
  "/admin",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

/**
 * Edge middleware that (1) refreshes the Supabase session on every
 * request so tokens don't expire mid-session and (2) gates the
 * post-login app routes. Unauthenticated visitors get redirected to
 * /login with ?next= preserving their intended destination. Signed-in
 * visitors who hit /login are redirected straight to /dashboard.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(URL, KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: do not put any logic between createServerClient and
  // getUser. Calling getUser refreshes the token and ensures the
  // cookie adapter writes it back via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Gate the app routes.
  if (isProtected(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  // Already signed in — skip /login.
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  /**
   * Run on all routes except Next internals and static brand assets.
   * The auth callback (/auth/callback) is intentionally INCLUDED so
   * that the cookie write from exchangeCodeForSession survives back
   * to the browser.
   */
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|brand/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};
