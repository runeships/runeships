import { redirect } from "next/navigation";
import { createClient } from "./supabase-server";

/**
 * Server-only guard for /admin/* routes. Run as the FIRST line of any
 * admin server component or server action:
 *
 *   const { user, profile } = await requireAdmin();
 *
 * Redirects to /login if not signed in, /dashboard if signed in but
 * not flagged admin. Returns the user + admin profile when access is
 * allowed.
 *
 * Promote a user to admin in the SQL editor:
 *   update public.profiles set is_admin = true where email = '…';
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/admin/regrades");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    // Don't leak the admin route's existence — non-admins bounce to
    // their dashboard like any other auth-gated path.
    redirect("/dashboard");
  }

  return { user, profile };
}

/**
 * Boolean variant that returns instead of redirecting — useful for
 * conditional UI (e.g., showing an "Admin" link in the nav).
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean(profile?.is_admin);
}
