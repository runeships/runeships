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
   * Sum of the user's 5 dimension aggregates. Null when the user has
   * no feedback. Used as the single number that drives the hero
   * longship's fill on the dashboard "Where you stand" panel.
   */
  overallAggregate: number | null;
  /**
   * The user's percentile when the cohort is ranked by overall
   * aggregate (sum across the 5 dims). Null when the user has no
   * feedback.
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
  const { data, error } = await admin.rpc("get_user_aggregates");

  if (error) {
    console.error("[getRankings rpc]", error);
    return emptyResult();
  }

  const rows = data ?? [];
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

  // Locate the caller's row.
  const userRow = rows.find((r) => r.user_id === userId);
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

  // Percentile per dimension: % of cohort strictly below the user.
  // Ties get the same percentile (we use strict <, not ≤).
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

  // Overall standing: sum of the user's 5 dimension aggregates,
  // ranked against the same sum for every other user in the cohort.
  // Used by the dashboard hero longship.
  const overallAggregate =
    userAggregates.strategy! +
    userAggregates.execution! +
    userAggregates.communication! +
    userAggregates.technical! +
    userAggregates.creativity!;
  const cohortOverall = rows.map(
    (r) =>
      Number(r.strategy) +
      Number(r.execution) +
      Number(r.communication) +
      Number(r.technical) +
      Number(r.creativity),
  );
  const below = cohortOverall.filter((v) => v < overallAggregate).length;
  const overallPercentile = Math.round((below / cohortSize) * 100);

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
  // Reuse getRankings only for cohort access; cheap enough to call.
  const admin = createAdminClient();
  const { data } = await admin.rpc("get_user_aggregates");
  if (!data || data.length === 0) return null;

  // We still want one row for the caller in the comparison set, but
  // with the hypothetical value substituted on the chosen dimension.
  // Build a comparable array of per-row aggregates on this dim.
  const aggregates = data.map((r) => {
    if (r.user_id === userId) return value;
    return Number(r[dim]);
  });

  const cohortSize = aggregates.length;
  if (cohortSize === 0) return null;
  const below = aggregates.filter((a) => a < value).length;
  return Math.round((below / cohortSize) * 100);
}

/* ─── Internal helpers ──────────────────────────────────────────── */

function percentileFor(
  rows: Array<{ user_id: string } & Record<Dimension, number | string>>,
  dim: Dimension,
  userValue: number | null,
): number | null {
  if (userValue === null) return null;
  const cohortSize = rows.length;
  if (cohortSize === 0) return null;
  const below = rows.filter((r) => Number(r[dim]) < userValue).length;
  return Math.round((below / cohortSize) * 100);
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
