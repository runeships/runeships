import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set.",
  );
}

/**
 * Browser-side Supabase client with cookie-based session handling via
 * @supabase/ssr. Use this from Client Components for `auth.signInWithOtp`,
 * `auth.signOut`, and any read on RLS-protected tables that should fire
 * with the user's session.
 *
 * Each call returns a fresh client. That's the SSR pattern — instantiate
 * inside the component scope rather than module-top-level.
 */
export function createClient() {
  return createBrowserClient<Database>(URL!, KEY!);
}
