/**
 * Seed 30 fake users with varied submissions and feedback so the
 * /leaderboard and cohort percentiles look statistically meaningful
 * during development.
 *
 * Run via: npm run seed:demo
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in
 * .env.local. Idempotent — exits cleanly if any profile with
 * is_seed=true already exists. Drop via `npm run seed:clear` before
 * re-running.
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { randomUUID } from "node:crypto";
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

type Dim = "strategy" | "execution" | "communication" | "technical" | "creativity";
type Tier = "high" | "medium" | "low";

type SeedUser = {
  name: string;
  school: string;
  gradYear: number;
  careerTracks: string[];
  specificSkills: string[];
  selfRated: Record<Dim, number>;
  tier: Tier;
  strength: Dim;
};

const DIMENSIONS: Dim[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

const TIER_BASE: Record<Tier, number> = { high: 85, medium: 62, low: 42 };
const TIER_TASK_RANGE: Record<Tier, [number, number]> = {
  high: [3, 5],
  medium: [2, 4],
  low: [1, 3],
};

const SEED_USERS: SeedUser[] = [
  // ─── 6 high-tier performers ────────────────────────────────────
  {
    name: "Maya Chen",
    school: "Stanford",
    gradYear: 2027,
    careerTracks: ["Strategy", "Communication"],
    specificSkills: ["Financial modeling", "Editorial writing", "Python"],
    selfRated: { strategy: 78, execution: 72, communication: 88, technical: 65, creativity: 70 },
    tier: "high",
    strength: "communication",
  },
  {
    name: "James Rodriguez",
    school: "MIT",
    gradYear: 2027,
    careerTracks: ["Technical", "Strategy"],
    specificSkills: ["Python", "Machine learning", "SQL", "Statistics"],
    selfRated: { strategy: 80, execution: 78, communication: 65, technical: 92, creativity: 70 },
    tier: "high",
    strength: "technical",
  },
  {
    name: "Aisha Patel",
    school: "UC Berkeley",
    gradYear: 2028,
    careerTracks: ["Strategy", "Execution"],
    specificSkills: ["User research", "Figma", "Brand strategy"],
    selfRated: { strategy: 86, execution: 80, communication: 76, technical: 60, creativity: 78 },
    tier: "high",
    strength: "strategy",
  },
  {
    name: "Sofia Kowalski",
    school: "Carnegie Mellon",
    gradYear: 2026,
    careerTracks: ["Creativity", "Communication"],
    specificSkills: ["Adobe Creative Suite", "Figma", "Editorial writing"],
    selfRated: { strategy: 70, execution: 82, communication: 80, technical: 68, creativity: 88 },
    tier: "high",
    strength: "creativity",
  },
  {
    name: "Lucas Müller",
    school: "ETH Zurich",
    gradYear: 2027,
    careerTracks: ["Technical", "Execution"],
    specificSkills: ["C++", "Python", "Financial modeling"],
    selfRated: { strategy: 76, execution: 90, communication: 64, technical: 84, creativity: 60 },
    tier: "high",
    strength: "execution",
  },
  {
    name: "Priya Nair",
    school: "Harvard",
    gradYear: 2026,
    careerTracks: ["Strategy", "Communication", "Creativity"],
    specificSkills: ["Editorial writing", "Brand strategy", "User research"],
    selfRated: { strategy: 84, execution: 76, communication: 86, technical: 60, creativity: 80 },
    tier: "high",
    strength: "communication",
  },
  // ─── 18 medium-tier ────────────────────────────────────────────
  {
    name: "Liam O'Brien",
    school: "Notre Dame",
    gradYear: 2028,
    careerTracks: ["Execution", "Technical"],
    specificSkills: ["Excel", "SQL", "Tableau / Power BI"],
    selfRated: { strategy: 60, execution: 70, communication: 55, technical: 72, creativity: 50 },
    tier: "medium",
    strength: "execution",
  },
  {
    name: "Jin Park",
    school: "Columbia",
    gradYear: 2028,
    careerTracks: ["Technical", "Strategy"],
    specificSkills: ["Python", "Statistics", "Machine learning"],
    selfRated: { strategy: 64, execution: 60, communication: 50, technical: 78, creativity: 55 },
    tier: "medium",
    strength: "technical",
  },
  {
    name: "Olivia Schmidt",
    school: "NYU",
    gradYear: 2027,
    careerTracks: ["Creativity", "Communication"],
    specificSkills: ["Figma", "Editorial writing", "Adobe Creative Suite"],
    selfRated: { strategy: 55, execution: 60, communication: 70, technical: 45, creativity: 75 },
    tier: "medium",
    strength: "creativity",
  },
  {
    name: "Marcus Williams",
    school: "University of Michigan",
    gradYear: 2026,
    careerTracks: ["Strategy", "Communication"],
    specificSkills: ["PowerPoint / Keynote", "Editorial writing", "Brand strategy"],
    selfRated: { strategy: 72, execution: 58, communication: 68, technical: 48, creativity: 60 },
    tier: "medium",
    strength: "strategy",
  },
  {
    name: "Daniel Garcia",
    school: "UT Austin",
    gradYear: 2028,
    careerTracks: ["Execution"],
    specificSkills: ["Financial modeling", "Excel", "Google Sheets"],
    selfRated: { strategy: 55, execution: 75, communication: 50, technical: 65, creativity: 45 },
    tier: "medium",
    strength: "execution",
  },
  {
    name: "Emma Thompson",
    school: "Northwestern",
    gradYear: 2027,
    careerTracks: ["Communication"],
    specificSkills: ["Editorial writing", "PowerPoint / Keynote"],
    selfRated: { strategy: 60, execution: 58, communication: 78, technical: 42, creativity: 65 },
    tier: "medium",
    strength: "communication",
  },
  {
    name: "Yuki Tanaka",
    school: "NUS",
    gradYear: 2028,
    careerTracks: ["Technical", "Creativity"],
    specificSkills: ["Python", "Figma", "JavaScript / TypeScript"],
    selfRated: { strategy: 58, execution: 65, communication: 55, technical: 70, creativity: 68 },
    tier: "medium",
    strength: "technical",
  },
  {
    name: "Carlos Mendes",
    school: "IE Madrid",
    gradYear: 2027,
    careerTracks: ["Strategy", "Execution"],
    specificSkills: ["Financial modeling", "Excel", "PowerPoint / Keynote"],
    selfRated: { strategy: 70, execution: 68, communication: 60, technical: 55, creativity: 50 },
    tier: "medium",
    strength: "strategy",
  },
  {
    name: "Hannah Cohen",
    school: "Brown",
    gradYear: 2028,
    careerTracks: ["Creativity", "Strategy"],
    specificSkills: ["Editorial writing", "Brand strategy", "User research"],
    selfRated: { strategy: 64, execution: 55, communication: 65, technical: 40, creativity: 72 },
    tier: "medium",
    strength: "creativity",
  },
  {
    name: "Ahmed Hassan",
    school: "Oxford",
    gradYear: 2026,
    careerTracks: ["Strategy", "Technical"],
    specificSkills: ["Statistics", "R", "Financial modeling"],
    selfRated: { strategy: 75, execution: 60, communication: 58, technical: 68, creativity: 50 },
    tier: "medium",
    strength: "strategy",
  },
  {
    name: "Zoe Lin",
    school: "UCLA",
    gradYear: 2029,
    careerTracks: ["Communication", "Creativity"],
    specificSkills: ["Editorial writing", "Figma", "Notion"],
    selfRated: { strategy: 55, execution: 60, communication: 72, technical: 42, creativity: 70 },
    tier: "medium",
    strength: "communication",
  },
  {
    name: "Anna Petrov",
    school: "Cambridge",
    gradYear: 2027,
    careerTracks: ["Strategy"],
    specificSkills: ["Financial modeling", "PowerPoint / Keynote"],
    selfRated: { strategy: 68, execution: 62, communication: 58, technical: 55, creativity: 50 },
    tier: "medium",
    strength: "strategy",
  },
  {
    name: "Rachel Goldberg",
    school: "UPenn",
    gradYear: 2028,
    careerTracks: ["Execution", "Strategy"],
    specificSkills: ["Excel", "SQL", "Financial modeling"],
    selfRated: { strategy: 60, execution: 72, communication: 55, technical: 60, creativity: 48 },
    tier: "medium",
    strength: "execution",
  },
  {
    name: "Tyler Brooks",
    school: "Vanderbilt",
    gradYear: 2029,
    careerTracks: ["Technical"],
    specificSkills: ["Python", "SQL"],
    selfRated: { strategy: 50, execution: 65, communication: 48, technical: 75, creativity: 45 },
    tier: "medium",
    strength: "technical",
  },
  {
    name: "Sara Ibrahim",
    school: "IIT Bombay",
    gradYear: 2028,
    careerTracks: ["Technical", "Execution"],
    specificSkills: ["Python", "Java", "SQL", "Statistics"],
    selfRated: { strategy: 62, execution: 70, communication: 50, technical: 72, creativity: 55 },
    tier: "medium",
    strength: "execution",
  },
  {
    name: "Kevin Lee",
    school: "Williams College",
    gradYear: 2029,
    careerTracks: ["Strategy", "Communication"],
    specificSkills: ["Editorial writing", "PowerPoint / Keynote", "Notion"],
    selfRated: { strategy: 65, execution: 55, communication: 70, technical: 45, creativity: 58 },
    tier: "medium",
    strength: "communication",
  },
  {
    name: "Maria Fernandez",
    school: "University of Chicago",
    gradYear: 2027,
    careerTracks: ["Creativity", "Communication"],
    specificSkills: ["Adobe Creative Suite", "Figma", "Editorial writing"],
    selfRated: { strategy: 55, execution: 62, communication: 68, technical: 45, creativity: 72 },
    tier: "medium",
    strength: "creativity",
  },
  {
    name: "Camille Dubois",
    school: "INSEAD",
    gradYear: 2026,
    careerTracks: ["Strategy", "Execution"],
    specificSkills: ["Financial modeling", "Excel", "Statistics"],
    selfRated: { strategy: 70, execution: 65, communication: 60, technical: 58, creativity: 50 },
    tier: "medium",
    strength: "strategy",
  },
  // ─── 6 low-tier ────────────────────────────────────────────────
  {
    name: "Aaron Reyes",
    school: "University of Toronto",
    gradYear: 2029,
    careerTracks: ["Execution"],
    specificSkills: ["Excel", "Google Sheets"],
    selfRated: { strategy: 42, execution: 50, communication: 38, technical: 35, creativity: 32 },
    tier: "low",
    strength: "execution",
  },
  {
    name: "Lily Wong",
    school: "McGill",
    gradYear: 2030,
    careerTracks: ["Communication"],
    specificSkills: ["Editorial writing", "Notion"],
    selfRated: { strategy: 40, execution: 38, communication: 55, technical: 30, creativity: 45 },
    tier: "low",
    strength: "communication",
  },
  {
    name: "Ben Foster",
    school: "LSE",
    gradYear: 2028,
    careerTracks: ["Strategy"],
    specificSkills: ["PowerPoint / Keynote", "Excel"],
    selfRated: { strategy: 52, execution: 40, communication: 42, technical: 30, creativity: 35 },
    tier: "low",
    strength: "strategy",
  },
  {
    name: "Ravi Sharma",
    school: "Yale",
    gradYear: 2030,
    careerTracks: ["Technical"],
    specificSkills: ["Python", "SQL"],
    selfRated: { strategy: 38, execution: 42, communication: 32, technical: 55, creativity: 30 },
    tier: "low",
    strength: "technical",
  },
  {
    name: "Sophia Russo",
    school: "Pomona",
    gradYear: 2029,
    careerTracks: ["Creativity", "Communication"],
    specificSkills: ["Figma", "Adobe Creative Suite"],
    selfRated: { strategy: 40, execution: 42, communication: 50, technical: 32, creativity: 58 },
    tier: "low",
    strength: "creativity",
  },
  {
    name: "Noah Carter",
    school: "Princeton",
    gradYear: 2025,
    careerTracks: ["Strategy", "Execution"],
    specificSkills: ["Financial modeling", "Excel", "PowerPoint / Keynote"],
    selfRated: { strategy: 48, execution: 52, communication: 42, technical: 40, creativity: 35 },
    tier: "low",
    strength: "strategy",
  },
];

if (SEED_USERS.length !== 30) {
  console.error(`Expected 30 seed users, got ${SEED_USERS.length}`);
  process.exit(1);
}

function emailFor(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-");
  return `seed-${slug}@runeships-seed.local`;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function noise(magnitude: number): number {
  return (Math.random() * 2 - 1) * magnitude;
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function randomTimestampWithin30Days(): string {
  const now = Date.now();
  const offset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
  return new Date(now - offset).toISOString();
}

function computeFeedbackScores(
  tier: Tier,
  strength: Dim,
): Record<Dim, number> {
  const base = TIER_BASE[tier];
  const scores: Record<Dim, number> = {} as Record<Dim, number>;
  for (const d of DIMENSIONS) {
    const strengthBoost = d === strength ? 12 : 0;
    scores[d] = clamp(base + strengthBoost + noise(10));
  }
  return scores;
}

async function main() {
  // ─── Idempotency check ──────────────────────────────────────────
  const { data: existing, error: existingErr } = await admin
    .from("profiles")
    .select("id")
    .eq("is_seed", true)
    .limit(1);

  if (existingErr) {
    console.error("Couldn't check existing seed profiles:", existingErr);
    process.exit(1);
  }
  if (existing && existing.length > 0) {
    console.log(
      "Seed users already exist. Drop them by running\n  npm run seed:clear\nbefore re-seeding.",
    );
    process.exit(0);
  }

  // ─── Fetch tasks (used for picking submissions + weights) ──────
  const { data: tasks, error: tasksErr } = await admin
    .from("tasks")
    .select(
      "id, title, submission_mode, weight_strategy, weight_execution, weight_communication, weight_technical, weight_creativity",
    )
    .eq("is_published", true);

  if (tasksErr || !tasks || tasks.length === 0) {
    console.error(
      "Couldn't fetch published tasks. Run the task seeds first.",
      tasksErr,
    );
    process.exit(1);
  }
  console.log(`Found ${tasks.length} published tasks to draw from.\n`);

  // ─── Create users + submissions + feedback ──────────────────────
  const scoreBuckets = { "0-30": 0, "30-50": 0, "50-70": 0, "70-85": 0, "85-100": 0 };
  let totalSubmissions = 0;

  for (const seedUser of SEED_USERS) {
    const email = emailFor(seedUser.name);
    // Random throwaway password — not stored anywhere, we don't care.
    const password = randomUUID() + randomUUID();

    process.stdout.write(`Creating ${seedUser.name} … `);
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: seedUser.name },
    });
    if (createErr || !created.user) {
      console.error("create failed:", createErr);
      continue;
    }
    const userId = created.user.id;

    // The on_auth_user_created trigger inserts a base profile row;
    // we update it with the seed details + flip is_seed.
    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        full_name: seedUser.name,
        school: seedUser.school,
        graduation_year: seedUser.gradYear,
        career_tracks: seedUser.careerTracks,
        specific_skills: seedUser.specificSkills,
        self_rated_strategy: seedUser.selfRated.strategy,
        self_rated_execution: seedUser.selfRated.execution,
        self_rated_communication: seedUser.selfRated.communication,
        self_rated_technical: seedUser.selfRated.technical,
        self_rated_creativity: seedUser.selfRated.creativity,
        onboarding_completed: true,
        is_seed: true,
        leaderboard_visible: true,
      })
      .eq("id", userId);
    if (profileErr) {
      console.error("profile update failed:", profileErr);
      continue;
    }

    // Submissions: pick a random task count per tier.
    const [min, max] = TIER_TASK_RANGE[seedUser.tier];
    const submissionCount = min + Math.floor(Math.random() * (max - min + 1));
    const chosenTasks = pickN(tasks, submissionCount);

    let userSubmissions = 0;
    for (const task of chosenTasks) {
      const timestamp = randomTimestampWithin30Days();
      const needsLink =
        task.submission_mode === "link_only" ||
        task.submission_mode === "text_and_link";

      const { data: submission, error: subErr } = await admin
        .from("submissions")
        .insert({
          user_id: userId,
          task_id: task.id,
          submission_title: `${seedUser.name}'s submission on ${task.title}`,
          submission_body:
            "Seed submission — placeholder body for development data. Not user-facing.",
          supporting_link: needsLink ? "https://example.com/seed-link" : null,
          link_access_confirmed: needsLink ? true : false,
          created_at: timestamp,
        })
        .select("id")
        .single();
      if (subErr || !submission) {
        console.error("submission insert failed:", subErr);
        continue;
      }

      const scores = computeFeedbackScores(seedUser.tier, seedUser.strength);
      const total =
        scores.strategy * task.weight_strategy +
        scores.execution * task.weight_execution +
        scores.communication * task.weight_communication +
        scores.technical * task.weight_technical +
        scores.creativity * task.weight_creativity;
      const totalRounded = Math.round(total * 10) / 10;

      // Bucket every per-dim score for the summary histogram.
      for (const d of DIMENSIONS) {
        const s = scores[d];
        if (s < 30) scoreBuckets["0-30"]++;
        else if (s < 50) scoreBuckets["30-50"]++;
        else if (s < 70) scoreBuckets["50-70"]++;
        else if (s < 85) scoreBuckets["70-85"]++;
        else scoreBuckets["85-100"]++;
      }

      const { error: fbErr } = await admin.from("feedback").insert({
        submission_id: submission.id,
        score_strategy: scores.strategy,
        score_execution: scores.execution,
        score_communication: scores.communication,
        score_technical: scores.technical,
        score_creativity: scores.creativity,
        total_score: totalRounded,
        qualitative_feedback:
          "Seed feedback — placeholder text for development data. Not user-facing.",
        model_used: "seed",
        generated_at: timestamp,
      });
      if (fbErr) {
        console.error("feedback insert failed:", fbErr);
        continue;
      }

      userSubmissions++;
      totalSubmissions++;
    }
    console.log(`(${userSubmissions} submissions, ${seedUser.tier})`);
  }

  // ─── Summary ────────────────────────────────────────────────────
  console.log("\n─── Summary ────────────────────────────────────");
  console.log(`Users created:     ${SEED_USERS.length}`);
  console.log(`Total submissions: ${totalSubmissions}`);
  console.log("Per-dimension score distribution (every dim, every submission):");
  for (const [bucket, count] of Object.entries(scoreBuckets)) {
    console.log(`  ${bucket.padStart(7)}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
