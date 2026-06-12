import {
  type Dimension,
  type RankingsResult,
  dimensionLabel,
} from "@/lib/rankings";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import { Longship } from "@/components/Longship";

const DIMENSIONS: Dimension[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

type RankingPanelProps = {
  rankings: RankingsResult;
  selfRated: RadarValues;
};

/**
 * "Where you stand" dashboard hero. Three states:
 *   - No feedback yet → fleet-in-port teaser (outline ships only)
 *   - Cohort ≥ 25    → confident headline "top X% on {dim}"
 *   - Cohort < 25    → provisional headline + provisional footer
 *
 * Two non-empty states use a dual-column layout: pentagon radar
 * (absolute scores) on the left, fleet of 5 longships (percentile
 * ranks) on the right. The pair is meant to read as one truth —
 * skill shape AND cohort standing.
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
          Your fleet awaits.
        </p>
        <p className="mt-5 text-[14px] leading-[1.6] text-muted max-w-[60ch]">
          Submit your first task to set sail. Your longships fill as you
          build out your skill profile — one ship per dimension, each
          rising with your cohort percentile.
        </p>

        {/* Fleet in port — outline-only ships as teaser. */}
        <div className="mt-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-7">
          {DIMENSIONS.map((d) => (
            <Longship
              key={d}
              percentile={null}
              dimension={d}
              score={null}
              size="small"
            />
          ))}
        </div>
      </div>
    );
  }

  const strongest = rankings.strongestDimension!;
  const strongestPercentile = rankings.userPercentiles[strongest] ?? 0;
  const topPct = Math.max(0, 100 - strongestPercentile);

  // Earned-scores polygon for the radar. We have feedback at this
  // point so userAggregates is non-null on every dim.
  const earnedValues: RadarValues = {
    strategy: rankings.userAggregates.strategy ?? 0,
    execution: rankings.userAggregates.execution ?? 0,
    communication: rankings.userAggregates.communication ?? 0,
    technical: rankings.userAggregates.technical ?? 0,
    creativity: rankings.userAggregates.creativity ?? 0,
  };

  return (
    <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
      {/* Headline */}
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

      {/* Dual-column layout — pentagon left, fleet right. */}
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
          {/* Compact legend so the dashed dimension makes sense at a glance. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
            <span className="inline-flex items-center gap-2 text-oxblood">
              <span
                aria-hidden
                className="inline-block w-3 h-1 bg-oxblood"
              />
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

        {/* RIGHT — fleet */}
        <div className="lg:pl-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Your fleet
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-8">
            {DIMENSIONS.map((d) => (
              <Longship
                key={d}
                percentile={rankings.userPercentiles[d]}
                dimension={d}
                score={rankings.userAggregates[d]}
                size="small"
                isStrongest={d === strongest}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-ink/10 space-y-2">
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
