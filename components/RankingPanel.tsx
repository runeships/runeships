import {
  type RankingsResult,
  dimensionLabel,
} from "@/lib/rankings";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import { Longship } from "@/components/Longship";

type RankingPanelProps = {
  rankings: RankingsResult;
  selfRated: RadarValues;
};

/**
 * "Where you stand" dashboard hero.
 *
 * - Empty state: single editorial inset with "Your ship awaits."
 *   copy + one ink-filled longship in port.
 * - Active: dual column on lg+ — pentagon radar on the left
 *   (per-dimension shape), single hero longship on the right
 *   filled to overallPercentile (cohort standing). Headline above
 *   both columns frames the strongest dimension; cohort +
 *   provisional footer below.
 */
export function RankingPanel({ rankings, selfRated }: RankingPanelProps) {
  const hasFeedback = rankings.strongestDimension !== null;

  // ─── Empty state ─────────────────────────────────────────────
  if (!hasFeedback) {
    return (
      <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Getting started
        </p>
        <p
          className="mt-4 font-display font-light leading-[1.1] tracking-[-0.018em] text-ink"
          style={{ fontSize: "clamp(1.6rem, 1.6vw + 1rem, 1.85rem)" }}
        >
          Your ship awaits.
        </p>
        <p className="mt-5 text-[14px] leading-[1.6] text-muted max-w-[60ch]">
          Submit your first task to set sail. Your longship fills as
          your overall percentile rises through the RuneShips cohort.
        </p>

        <div className="mt-10 flex justify-center">
          <Longship
            percentile={null}
            ariaLabel="Your longship — in port, no submissions yet."
            className="w-full max-w-[360px] aspect-[1485/763]"
          />
        </div>
      </div>
    );
  }

  const strongest = rankings.strongestDimension!;
  const strongestPercentile = rankings.userPercentiles[strongest] ?? 0;
  const topPct = Math.max(0, 100 - strongestPercentile);

  const earnedValues: RadarValues = {
    strategy: rankings.userAggregates.strategy ?? 0,
    execution: rankings.userAggregates.execution ?? 0,
    communication: rankings.userAggregates.communication ?? 0,
    technical: rankings.userAggregates.technical ?? 0,
    creativity: rankings.userAggregates.creativity ?? 0,
  };

  const overallPercentile = rankings.overallPercentile ?? 0;
  const overallTopPct = Math.max(0, 100 - overallPercentile);

  return (
    <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
      {/* Headline — strongest-dimension framing, confident vs provisional */}
      {rankings.isProvisional ? (
        <p
          className="font-display font-light leading-[1.15] tracking-[-0.018em] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.6vw + 1rem, 1.85rem)" }}
        >
          Your strongest dimension is{" "}
          <span className="text-oxblood">{dimensionLabel(strongest)}</span> —
          you&rsquo;re outperforming{" "}
          <span className="text-oxblood">{strongestPercentile}%</span> of the
          cohort so far.
        </p>
      ) : (
        <>
          <p
            className="font-display font-light leading-[1.05] tracking-[-0.022em] text-ink"
            style={{ fontSize: "clamp(2rem, 2.4vw + 1rem, 2.5rem)" }}
          >
            You&rsquo;re in the top{" "}
            <span className="text-oxblood">{topPct}%</span> on{" "}
            <span className="text-oxblood">{dimensionLabel(strongest)}</span>.
          </p>
          <p className="mt-4 font-display italic text-[15px] text-muted">
            Your strongest dimension.
          </p>
        </>
      )}

      {/* Dual-column: pentagon (per-dim shape) + hero longship (overall standing) */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0">
        {/* LEFT — radar */}
        <div className="lg:pr-8 lg:border-r lg:border-ink/10">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Your skill shape
          </p>
          <div className="mt-6 flex justify-center lg:justify-start">
            <div className="border border-ink/15 bg-cream px-10 py-7 sm:px-12 sm:py-8">
              <RadarChart
                values={earnedValues}
                compareValues={selfRated}
                percentiles={rankings.userPercentiles}
                size={320}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
            <span className="inline-flex items-center gap-2 text-oxblood">
              <span aria-hidden className="inline-block w-3 h-1 bg-oxblood" />
              Earned
            </span>
            <span className="inline-flex items-center gap-2 text-ink/55">
              <span
                aria-hidden
                className="inline-block w-3 h-px border-t border-dashed border-ink/45"
              />
              Self-rated
            </span>
          </div>
        </div>

        {/* RIGHT — single hero longship + overall standing */}
        <div className="lg:pl-8 flex flex-col items-center text-center">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted self-start lg:self-auto">
            Your standing
          </p>

          {/* Hero ship — scales responsively, min-width prevents crush
              on tiny viewports. */}
          <div className="mt-6 w-full flex justify-center">
            <Longship
              percentile={overallPercentile}
              ariaLabel={`Your overall longship — top ${overallTopPct}% across all five dimensions.`}
              className="w-full max-w-[480px] min-w-[260px] aspect-[1485/763]"
            />
          </div>

          <p
            className="mt-7 font-display font-light leading-[1.05] tracking-[-0.022em] text-oxblood"
            style={{
              fontSize: "clamp(1.9rem, 2.2vw + 1rem, 2.25rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Top {overallTopPct}% overall
          </p>
          <p className="mt-2 text-[12px] tracking-[0.06em] uppercase text-muted">
            Across all five RuneShips dimensions
          </p>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-ink/10 space-y-2">
        <p className="text-[12px] leading-[1.55] text-muted">
          Computed from your best score per task, averaged across all
          completed tasks. Cohort size: {rankings.cohortSize}{" "}
          {rankings.cohortSize === 1 ? "student" : "students"}.
        </p>
        {rankings.isProvisional && (
          <p className="text-[12px] leading-[1.55] italic text-oxblood">
            Provisional rankings. RuneShips is early — these refine as more
            students join.
          </p>
        )}
      </div>
    </div>
  );
}
