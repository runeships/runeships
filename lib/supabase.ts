import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set in .env.local.",
  );
}

/**
 * Server-callable Supabase client using the publishable (anon) key.
 *
 * Writes are governed by row-level security policies in `db/migrations/`.
 * Use this from server actions for INSERT-only landing-page traffic.
 * For admin reads or maintenance, swap to a service-role client.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
