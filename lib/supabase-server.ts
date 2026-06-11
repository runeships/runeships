import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  throw new Error(
    "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set.",
  );
}

/**
 * Server-side Supabase client wired to Next.js `cookies()`. Use from
 * Server Components, Server Actions, and Route Handlers. The cookie
 * adapter reads the session cookie on every call and writes back
 * refreshed tokens when @supabase/ssr decides to rotate them.
 *
 * Returns a per-request client — instantiate inside the action /
 * component, not at module top level.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(URL!, KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components are read-only for cookies — this branch
          // is expected when called from a Server Component. Middleware
          // handles the actual session refresh; the error is safe to
          // swallow per @supabase/ssr guidance.
        }
      },
    },
  });
}
