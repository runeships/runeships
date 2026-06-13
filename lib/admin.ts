import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

/**
 * Parse the ADMIN_EMAILS env var into a lowercased Set for O(1)
 * membership checks. Empty / unset → empty set. Used by both the
 * route-level guards and the StickyNav admin link visibility check.
 */
function adminEmailSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set(list);
}

/** Parsed once per request — cheap operation but keeps the call sites tidy. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailSet().has(email.toLowerCase());
}

/** Exposed for the email-notification helpers that need to fan out
 *  to every configured admin. */
export function getAdminEmails(): string[] {
  return Array.from(adminEmailSet());
}

/**
 * Server-only guard for /admin/* routes. Run as the FIRST line of any
 * admin server component or server action.
 *
 * Allows access if EITHER:
 *   - profiles.is_admin = true for the signed-in user, OR
 *   - the signed-in user's email is in ADMIN_EMAILS env var
 *
 * The two paths exist so the env var can grant admin access without
 * a DB write (useful when a new admin joins and you don't want to
 * round-trip to the SQL editor), while the DB flag remains the
 * persistent source of truth for promoted accounts.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  const allowed = Boolean(profile?.is_admin) || isAdminEmail(user.email);
  if (!allowed) {
    // Don't leak the admin route's existence — non-admins bounce to
    // their dashboard like any other auth-gated path.
    redirect("/dashboard");
  }

  return { user, profile };
}

/**
 * Boolean variant that returns instead of redirecting — useful for
 * conditional UI (the "Review queue" item in the profile dropdown).
 * Checks both paths same as requireAdmin().
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (isAdminEmail(user.email)) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return Boolean(profile?.is_admin);
}
