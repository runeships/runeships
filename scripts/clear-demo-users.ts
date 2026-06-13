/**
 * Delete every profile flagged is_seed=true along with their auth
 * users. Submissions, feedback, and regrade requests cascade out
 * via FK relations on auth.users(id).
 *
 * Run via: npm run seed:clear
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import type { Database } from "../lib/database.types";

loadEnv({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const admin = createClient<Database>(URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: seedProfiles, error: fetchErr } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("is_seed", true);

  if (fetchErr) {
    console.error("Couldn't fetch seed profiles:", fetchErr);
    process.exit(1);
  }
  if (!seedProfiles || seedProfiles.length === 0) {
    console.log("No seed users to clear.");
    return;
  }

  console.log(`Deleting ${seedProfiles.length} seed users…\n`);
  let deleted = 0;
  let failed = 0;
  for (const profile of seedProfiles) {
    process.stdout.write(`  ${profile.full_name ?? profile.id} … `);
    const { error: delErr } = await admin.auth.admin.deleteUser(profile.id);
    if (delErr) {
      console.log("failed:", delErr.message);
      failed++;
      continue;
    }
    console.log("ok");
    deleted++;
  }

  console.log(`\nDeleted ${deleted}/${seedProfiles.length} seed users.`);
  if (failed > 0) {
    console.log(`${failed} failed — inspect Supabase logs.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
