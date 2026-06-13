/**
 * Delete every profile flagged is_seed=true along with their auth
 * users AND any orphan auth users whose email matches the seed
 * pattern (seed-*@runeships-seed.local). Catches the case where
 * createUser() succeeded but the profile UPDATE failed mid-run, so
 * is_seed never got flipped — those still need cleaning up before
 * the next seed:demo can run without email collisions.
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

const SEED_EMAIL_RE = /^seed-.*@runeships-seed\.local$/i;

async function listAuthUsersByEmail(): Promise<
  Array<{ id: string; email: string }>
> {
  // listUsers is paginated. Walk every page so we catch all matches
  // regardless of how many real users exist alongside.
  const results: Array<{ id: string; email: string }> = [];
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.error("listUsers failed:", error);
      break;
    }
    for (const u of data?.users ?? []) {
      if (u.email && SEED_EMAIL_RE.test(u.email)) {
        results.push({ id: u.id, email: u.email });
      }
    }
    const total = data?.total ?? 0;
    if (page * perPage >= total) break;
    page++;
  }
  return results;
}

async function main() {
  // ─── Path 1: profile flag-based ────────────────────────────
  const { data: flaggedProfiles, error: fetchErr } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("is_seed", true);
  if (fetchErr) {
    console.error("Couldn't fetch seed profiles:", fetchErr);
    process.exit(1);
  }

  // ─── Path 2: email-pattern orphans ─────────────────────────
  const orphans = await listAuthUsersByEmail();

  // Merge — flagged profiles + orphan emails may overlap; dedupe by id.
  const idsToDelete = new Map<string, string>();
  for (const p of flaggedProfiles ?? []) {
    idsToDelete.set(p.id, p.full_name ?? "(flagged seed)");
  }
  for (const o of orphans) {
    if (!idsToDelete.has(o.id)) idsToDelete.set(o.id, o.email);
  }

  if (idsToDelete.size === 0) {
    console.log("No seed users to clear.");
    return;
  }

  console.log(`Deleting ${idsToDelete.size} seed users…\n`);
  let deleted = 0;
  let failed = 0;
  for (const [id, label] of idsToDelete.entries()) {
    process.stdout.write(`  ${label} … `);
    const { error: delErr } = await admin.auth.admin.deleteUser(id);
    if (delErr) {
      console.log("failed:", delErr.message);
      failed++;
      continue;
    }
    console.log("ok");
    deleted++;
  }

  console.log(`\nDeleted ${deleted}/${idsToDelete.size} seed users.`);
  if (failed > 0) {
    console.log(`${failed} failed — inspect Supabase logs.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
