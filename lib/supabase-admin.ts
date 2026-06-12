import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client: SupabaseClient<Database> | null = null;

/**
 * Service-role Supabase client. BYPASSES RLS — use only from server
 * actions that need to write to RLS-restricted tables (notably the
 * `feedback` table, whose INSERT policy is service-role-only by
 * design).
 *
 * Throws at first call if `SUPABASE_SERVICE_ROLE_KEY` isn't set, so a
 * misconfigured deploy fails loudly instead of silently dropping
 * writes.
 *
 * The service role key lives in:
 *   - `.env.local` for local dev (gitignored)
 *   - Vercel → Project → Settings → Environment Variables for prod
 *
 * Grab the key from Supabase Dashboard → Project Settings → API Keys
 * (the `service_role` / `sb_secret_…` value).
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (!URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local.",
    );
  }
  if (!SERVICE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local " +
        "and to your Vercel project's environment variables so server " +
        "actions can write to RLS-restricted tables.",
    );
  }
  if (_client) return _client;
  _client = createClient<Database>(URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
