// PRIVACY: This helper only returns the calling user's data +
// cohort-wide aggregates. Never exposes other users' identifying
// info. If extending, preserve this constraint.
//
// TODO: At ~500+ users this should move to a materialized view or a
// precomputed user_rankings table refreshed on submission insert.
// Current full-scan recomputation is fine while we're sub-100 users.

import { cache } from "react";
import { createAdminClient } from "./supabase-admin";

export type Dimension =
  | "strategy"
  | "execution"
  | "communication"
  | "technical"
  | "creativity";

const DIMENSIONS: Dimension[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

const PROVISIONAL_THRESHOLD = 25;

export type RankingsResult = {
  cohortSize: number;
  isProvisional: boolean;
  userAggregates: Record<Dimension, number | null>;
  userPercentiles: Record<Dimension, number | null>;
  cohortMeans: Record<Dimension, number>;
  strongestDimension: Dimension | null;
  weakestDimension: Dimension | null;
  /**
   * The user's average best-total-score per task (mean of the
   * max(total_score) per task across all tasks they've submitted to).
   * Null when the user has no feedback. Drives the dashboard hero
   * longship — this is the primary "overall standing" metric.
   *
   * Was previously the sum across 5 dimensions; switched to
   * avg-per-task because it normalizes by task count (volume doesn't
   * inflate rank).
   */
  overallAggregate: number | null;
  /**
   * The user's percentile when the cohort is ranked by avg-per-task.
   * Null when the user has no feedback.
   */
  overallPercentile: number | null;
};

/**
 * Compute cohort-wide aggregates and the caller's percentile rank
 * on each of the five RuneShips dimensions.
 *
 * Uses React `cache` for per-request memoization — if /dashboard and
 * the submission detail page both call this within the same render,
 * the underlying RPC fires once.
 *
 * Pulls data via the service-role admin client (bypassing RLS) so
 * the function can see every user's aggregates. JS layer then keeps
 * only aggregate stats and the caller's own row in the returned
 * shape — no other user_id ever escapes this module.
 */
export const getRankings = cache(async function getRankingsImpl(
  userId: string,
): Promise<RankingsResult> {
  const admin = createAdminClient();
  // submissions + feedback are needed to compute avg-per-task per
  // user — the metric that drives `overallAggregate` /
  // `overallPercentile`. RPC stays the source of truth for the
  // per-dimension aggregates.
  const [aggregatesRes, submissionsRes, feedbackRes, visibleIds] =
    await Promise.all([
      admin.rpc("get_user_aggregates"),
      admin.from("submissions").select("id, user_id, task_id"),
      admin.from("feedback").select("submission_id, total_score"),
      getVisibleUserIds(admin),
    ]);

  if (aggregatesRes.error) {
    console.error("[getRankings rpc]", aggregatesRes.error);
    return emptyResult();
  }

  const allRows = aggregatesRes.data ?? [];
  // visibleIds === null means migration 016 hasn't run yet, in which
  // case we don't filter — treat all users as visible. Once the
  // column exists, opted-out users drop out of the cohort numerator.
  // The caller is found in the unfiltered list either way so opted-
  // out users still see their own standing.
  const rows =
    visibleIds === null
      ? allRows
      : allRows.filter((r) => visibleIds.has(r.user_id));
  const cohortSize = rows.length;

  if (cohortSize === 0) {
    return emptyResult();
  }

  // Cohort means across every user's per-dimension aggregate.
  const cohortMeans: Record<Dimension, number> = {
    strategy: avg(rows.map((r) => Number(r.strategy))),
    execution: avg(rows.map((r) => Number(r.execution))),
    communication: avg(rows.map((r) => Number(r.communication))),
    technical: avg(rows.map((r) => Number(r.technical))),
    creativity: avg(rows.map((r) => Number(r.creativity))),
  };

  // Locate the caller's row. We check the FULL aggregates list (not
  // the visibility-filtered cohort) so users who opted out of the
  // leaderboard still see their own standing.
  const userRow = allRows.find((r) => r.user_id === userId);
  if (!userRow) {
    return {
      cohortSize,
      isProvisional: cohortSize < PROVISIONAL_THRESHOLD,
      userAggregates: nullDims(),
      userPercentiles: nullDims(),
      cohortMeans,
      strongestDimension: null,
      weakestDimension: null,
      overallAggregate: null,
      overallPercentile: null,
    };
  }

  const userAggregates: Record<Dimension, number | null> = {
    strategy: Number(userRow.strategy),
    execution: Number(userRow.execution),
    communication: Number(userRow.communication),
    technical: Number(userRow.technical),
    creativity: Number(userRow.creativity),
  };

  // Percentile per dimension: % of cohort at or below the user
  // (≤, not strict <). Counting the user themselves means the solo
  // cohort case resolves to 100 — "rank 1 of 1" — instead of 0,
  // which keeps the tally visual and the "Top X%" caption in sync.
  // Ties resolve to the max of the tied group, which is the standard
  // "best rank" tie-handling for percentile rank.
  const userPercentiles: Record<Dimension, number | null> = {
    strategy: percentileFor(rows, "strategy", userAggregates.strategy),
    execution: percentileFor(rows, "execution", userAggregates.execution),
    communication: percentileFor(rows, "communication", userAggregates.communication),
    technical: percentileFor(rows, "technical", userAggregates.technical),
    creativity: percentileFor(rows, "creativity", userAggregates.creativity),
  };

  // Strongest/weakest = the dimension where the user's percentile is
  // highest/lowest. Falls back to comparing raw aggregates if all
  // percentiles tie (e.g. solo cohort, every percentile = 0).
  const dims = DIMENSIONS.filter((d) => userPercentiles[d] !== null);
  let strongestDimension: Dimension | null = null;
  let weakestDimension: Dimension | null = null;
  if (dims.length > 0) {
    strongestDimension = dims.reduce((best, d) => {
      const candidate = userPercentiles[d] ?? -1;
      const current = userPercentiles[best] ?? -1;
      if (candidate > current) return d;
      if (candidate === current) {
        // Break ties by raw aggregate so the highlight is meaningful
        // when every dimension shares the same percentile.
        const candidateAgg = userAggregates[d] ?? -1;
        const currentAgg = userAggregates[best] ?? -1;
        if (candidateAgg > currentAgg) return d;
      }
      return best;
    }, dims[0]);
    weakestDimension = dims.reduce((worst, d) => {
      const candidate = userPercentiles[d] ?? 101;
      const current = userPercentiles[worst] ?? 101;
      if (candidate < current) return d;
      if (candidate === current) {
        const candidateAgg = userAggregates[d] ?? 101;
        const currentAgg = userAggregates[worst] ?? 101;
        if (candidateAgg < currentAgg) return d;
      }
      return worst;
    }, dims[0]);
  }

  // Overall standing — now driven by avg-per-task instead of
  // sum-of-dimensions. Compute by joining submissions → feedback in
  // JS: pick the best total_score per (user, task), then average per
  // user. Sum-of-dimensions rewarded breadth (more dims → higher
  // sum); avg-per-task is more about per-task quality.
  const submissionsById = new Map<
    string,
    { user_id: string; task_id: string }
  >();
  for (const s of submissionsRes.data ?? []) {
    submissionsById.set(s.id, { user_id: s.user_id, task_id: s.task_id });
  }
  const bestTotalByUserTask = new Map<string, Map<string, number>>();
  for (const fb of feedbackRes.data ?? []) {
    const sub = submissionsById.get(fb.submission_id);
    if (!sub) continue;
    let userMap = bestTotalByUserTask.get(sub.user_id);
    if (!userMap) {
      userMap = new Map();
      bestTotalByUserTask.set(sub.user_id, userMap);
    }
    const existing = userMap.get(sub.task_id);
    userMap.set(
      sub.task_id,
      existing === undefined ? fb.total_score : Math.max(existing, fb.total_score),
    );
  }
  const avgPerTaskByUser = new Map<string, number>();
  for (const [uid, taskMap] of bestTotalByUserTask) {
    const totals = Array.from(taskMap.values());
    if (totals.length === 0) continue;
    avgPerTaskByUser.set(
      uid,
      totals.reduce((s, n) => s + n, 0) / totals.length,
    );
  }

  // Caller's avg-per-task. They might not have any feedback yet
  // (e.g. their aggregates came in through the early-return branch)
  // — guard with null.
  const overallAggregate = avgPerTaskByUser.get(userId) ?? null;
  // Cohort to rank against = visible users with at least one
  // submission (i.e. they have an avg-per-task entry).
  const cohortAvgs = Array.from(avgPerTaskByUser.entries())
    .filter(([uid]) => visibleIds === null || visibleIds.has(uid))
    .map(([, avg]) => avg);
  let overallPercentile: number | null = null;
  if (overallAggregate !== null && cohortAvgs.length > 0) {
    const atOrBelow = cohortAvgs.filter((v) => v <= overallAggregate).length;
    overallPercentile = Math.round((atOrBelow / cohortAvgs.length) * 100);
  }

  return {
    cohortSize,
    isProvisional: cohortSize < PROVISIONAL_THRESHOLD,
    userAggregates,
    userPercentiles,
    cohortMeans,
    strongestDimension,
    weakestDimension,
    overallAggregate,
    overallPercentile,
  };
});

/**
 * Compute what percentile a given hypothetical aggregate would land
 * in for a specific dimension — used by the submission detail
 * "in context" sentence to ask "if this submission's score were my
 * aggregate, where would I rank?".
 *
 * Wraps getRankings so it shares the per-request cache.
 */
export async function hypotheticalPercentile(
  userId: string,
  dim: Dimension,
  value: number,
): Promise<number | null> {
  const admin = createAdminClient();
  const [aggregatesRes, visibleIds] = await Promise.all([
    admin.rpc("get_user_aggregates"),
    getVisibleUserIds(admin),
  ]);
  const data = aggregatesRes.data ?? [];
  if (data.length === 0) return null;

  // visibleIds === null → migration 016 hasn't run yet; don't filter.
  const cohortRows =
    visibleIds === null
      ? data
      : data.filter((r) => visibleIds.has(r.user_id));

  // Substitute the caller's hypothetical value when they're in the
  // cohort; otherwise the cohort is the baseline they're being
  // compared against.
  const aggregates = cohortRows.map((r) =>
    r.user_id === userId ? value : Number(r[dim]),
  );

  const cohortSize = aggregates.length;
  if (cohortSize === 0) return null;
  const atOrBelow = aggregates.filter((a) => a <= value).length;
  return Math.round((atOrBelow / cohortSize) * 100);
}

/* ─── Leaderboard helper ────────────────────────────────────────── */

/**
 * Per-(user, task) best scores. Independent max per dimension and
 * per total — matches the global aggregation strategy where a user's
 * "best on this dimension for this task" might come from a different
 * submission than their "best total on this task".
 */
export type TaskBest = {
  total: number;
  strategy: number;
  execution: number;
  communication: number;
  technical: number;
  creativity: number;
};

export type LeaderboardRow = {
  userId: string;
  fullName: string;
  school: string | null;
  graduationYear: number | null;
  aggregates: Record<Dimension, number | null>;
  overall: number | null;
  /** Average of the user's best total_score per task — distinct from
   *  `overall` (sum of per-dim aggregates) because it normalizes by
   *  task count instead of summing across dimensions. Null when the
   *  user has no feedback. */
  avgPerTask: number | null;
  submissionCount: number;
  /** Best scores per task the user has submitted to, keyed by task id.
   *  Powers the task-scoped leaderboard view. */
  taskScores: Record<string, TaskBest>;
};

export type LeaderboardTaskOption = {
  id: string;
  slug: string;
  title: string;
  companySlug: string;
};

export type LeaderboardData = {
  rows: LeaderboardRow[];
  tasks: LeaderboardTaskOption[];
};

/**
 * Returns one row per leaderboard-visible profile. Includes profiles
 * with no submissions yet (aggregates null, submissionCount 0) — the
 * /leaderboard page renders them at the bottom rather than hiding
 * them.
 *
 * Hits 3 tables (profiles + aggregates RPC + submissions) but all in
 * parallel. At <100 users this is fine; promote to a precomputed
 * view if the cohort gets large.
 */
export const getLeaderboard = cache(async function getLeaderboardImpl(): Promise<
  LeaderboardData
> {
  const admin = createAdminClient();
  const [
    profilesRes,
    aggregatesRes,
    submissionsRes,
    feedbackRes,
    tasksRes,
    companiesRes,
    visibleIds,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, school, graduation_year"),
    admin.rpc("get_user_aggregates"),
    admin.from("submissions").select("id, user_id, task_id"),
    admin
      .from("feedback")
      .select(
        "submission_id, total_score, score_strategy, score_execution, score_communication, score_technical, score_creativity",
      ),
    admin
      .from("tasks")
      .select("id, slug, title, company_id")
      .eq("is_published", true)
      .order("order_index", { ascending: true }),
    admin.from("companies").select("id, slug"),
    getVisibleUserIds(admin),
  ]);

  if (profilesRes.error) {
    console.error("[getLeaderboard profiles]", profilesRes.error);
    return { rows: [], tasks: [] };
  }
  if (aggregatesRes.error) {
    console.error("[getLeaderboard rpc]", aggregatesRes.error);
    return { rows: [], tasks: [] };
  }

  // Pre-migration tolerance — visibleIds=null means no filter applied.
  const allProfiles = profilesRes.data ?? [];
  const profiles =
    visibleIds === null
      ? allProfiles
      : allProfiles.filter((p) => visibleIds.has(p.id));

  const aggregatesByUser = new Map<string, (typeof aggregatesRes.data)[number]>();
  for (const row of aggregatesRes.data ?? []) {
    aggregatesByUser.set(row.user_id, row);
  }

  // ─── Per-(user, task) best scores ────────────────────────────
  // Join feedback ↔ submissions in JS. Independent max per dimension
  // matches the global aggregation in get_user_aggregates().
  const submissionsById = new Map<string, { user_id: string; task_id: string }>();
  for (const s of submissionsRes.data ?? []) {
    submissionsById.set(s.id, { user_id: s.user_id, task_id: s.task_id });
  }
  const taskBestByUser = new Map<string, Map<string, TaskBest>>();
  for (const fb of feedbackRes.data ?? []) {
    const sub = submissionsById.get(fb.submission_id);
    if (!sub) continue;
    let userMap = taskBestByUser.get(sub.user_id);
    if (!userMap) {
      userMap = new Map();
      taskBestByUser.set(sub.user_id, userMap);
    }
    const existing = userMap.get(sub.task_id);
    if (!existing) {
      userMap.set(sub.task_id, {
        total: fb.total_score,
        strategy: fb.score_strategy,
        execution: fb.score_execution,
        communication: fb.score_communication,
        technical: fb.score_technical,
        creativity: fb.score_creativity,
      });
    } else {
      existing.total = Math.max(existing.total, fb.total_score);
      existing.strategy = Math.max(existing.strategy, fb.score_strategy);
      existing.execution = Math.max(existing.execution, fb.score_execution);
      existing.communication = Math.max(
        existing.communication,
        fb.score_communication,
      );
      existing.technical = Math.max(existing.technical, fb.score_technical);
      existing.creativity = Math.max(existing.creativity, fb.score_creativity);
    }
  }

  // Submission counts per user.
  const submissionCounts = new Map<string, number>();
  for (const row of submissionsRes.data ?? []) {
    submissionCounts.set(
      row.user_id,
      (submissionCounts.get(row.user_id) ?? 0) + 1,
    );
  }

  // ─── Build task option list for the dropdown ─────────────────
  const companySlugMap = new Map<string, string>();
  for (const c of companiesRes.data ?? []) {
    companySlugMap.set(c.id, c.slug);
  }
  const tasks: LeaderboardTaskOption[] = (tasksRes.data ?? []).map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    companySlug: companySlugMap.get(t.company_id) ?? "",
  }));

  // ─── Build leaderboard rows ──────────────────────────────────
  const rows: LeaderboardRow[] = profiles.map((p): LeaderboardRow => {
    const agg = aggregatesByUser.get(p.id);
    const aggregates: Record<Dimension, number | null> = agg
      ? {
          strategy: Number(agg.strategy),
          execution: Number(agg.execution),
          communication: Number(agg.communication),
          technical: Number(agg.technical),
          creativity: Number(agg.creativity),
        }
      : nullDims();
    const overall = agg
      ? Number(agg.strategy) +
        Number(agg.execution) +
        Number(agg.communication) +
        Number(agg.technical) +
        Number(agg.creativity)
      : null;

    const userTasks = taskBestByUser.get(p.id);
    const taskScores: Record<string, TaskBest> = {};
    let avgPerTask: number | null = null;
    if (userTasks && userTasks.size > 0) {
      let sum = 0;
      for (const [taskId, best] of userTasks.entries()) {
        taskScores[taskId] = best;
        sum += best.total;
      }
      avgPerTask = sum / userTasks.size;
    }

    return {
      userId: p.id,
      fullName: p.full_name ?? "(unnamed)",
      school: p.school,
      graduationYear: p.graduation_year,
      aggregates,
      overall,
      avgPerTask,
      submissionCount: submissionCounts.get(p.id) ?? 0,
      taskScores,
    };
  });

  return { rows, tasks };
});

/* ─── Internal helpers ──────────────────────────────────────────── */

/**
 * Returns the set of user_ids opted into the leaderboard, or null if
 * the leaderboard_visible column doesn't exist yet (i.e. migration
 * 016 has not been run). Returning null tells the caller "don't
 * filter" so the app degrades gracefully in the pre-migration state.
 */
async function getVisibleUserIds(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Set<string> | null> {
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("leaderboard_visible", true);
  if (error) {
    // Most likely cause: column does not exist (pre-migration).
    // Log once so we know, but don't fail the request.
    console.warn(
      "[getVisibleUserIds] visibility filter unavailable — falling back to all users. Run migration 016 to enable.",
    );
    return null;
  }
  return new Set((data ?? []).map((p) => p.id));
}

function percentileFor(
  rows: Array<{ user_id: string } & Record<Dimension, number | string>>,
  dim: Dimension,
  userValue: number | null,
): number | null {
  if (userValue === null) return null;
  const cohortSize = rows.length;
  if (cohortSize === 0) return null;
  // ≤ so the user counts themselves in their own rank — solo cohort
  // resolves to 100, ties resolve to the top of the tied group.
  const atOrBelow = rows.filter((r) => Number(r[dim]) <= userValue).length;
  return Math.round((atOrBelow / cohortSize) * 100);
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((s, n) => s + n, 0);
  return sum / arr.length;
}

function nullDims(): Record<Dimension, number | null> {
  return {
    strategy: null,
    execution: null,
    communication: null,
    technical: null,
    creativity: null,
  };
}

function emptyResult(): RankingsResult {
  return {
    cohortSize: 0,
    isProvisional: true,
    userAggregates: nullDims(),
    userPercentiles: nullDims(),
    cohortMeans: {
      strategy: 0,
      execution: 0,
      communication: 0,
      technical: 0,
      creativity: 0,
    },
    strongestDimension: null,
    weakestDimension: null,
    overallAggregate: null,
    overallPercentile: null,
  };
}

/**
 * Capitalised display name for a dimension. Centralised so the
 * RankingPanel, SubmissionContext, and EarnedStanding components all
 * print the same labels.
 */
export function dimensionLabel(d: Dimension): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}
