import {
  type LeaderboardRow,
  type LeaderboardTaskOption,
  type RankingsResult,
  dimensionLabel,
} from "@/lib/rankings";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import { Longship } from "@/components/Longship";
import { PercentileTally } from "@/components/PercentileTally";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { FeedbackTrigger } from "@/components/FeedbackTrigger";

type RankingPanelProps = {
  rankings: RankingsResult;
  selfRated: RadarValues;
  leaderboardRows: LeaderboardRow[];
  leaderboardTasks: LeaderboardTaskOption[];
  currentUserId: string;
};

/**
 * "Where you stand" dashboard hero. Pentagon radar on the left
 * (per-dimension skill shape), decorative longship + percentile
 * tally on the right (overall standing). The headline above both
 * columns frames the strongest dimension; cohort + provisional
 * footer below.
 *
 * Empty state replaces the dual-column layout with a single
 * editorial inset: copy + decorative longship + muted tally.
 */
export function RankingPanel({
  rankings,
  selfRated,
  leaderboardRows,
  leaderboardTasks,
  currentUserId,
}: RankingPanelProps) {
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
          Your journey starts here.
        </p>
        <p className="mt-5 text-[14px] leading-[1.6] text-muted max-w-[60ch]">
          Submit your first task to find your place in the RuneShips
          cohort. Your standing rises as your scores accumulate.
        </p>

        <div className="mt-10">
          <Longship size="hero" ariaLabel="Viking longship illustration" />
        </div>

        <div className="mt-10">
          <PercentileTally percentile={null} width={420} />
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

  return (
    <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
      {/* Headline */}
      {rankings.isProvisional ? (
        <p
          className="font-display font-light leading-[1.15] tracking-[-0.018em] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.6vw + 1rem, 1.85rem)" }}
        >
          Your strongest dimension is{" "}
          <span className="text-oxblood">{dimensionLabel(strongest)}</span>,
          and you&rsquo;re outperforming{" "}
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

      {/* Dual-column */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0">
        {/* LEFT — pentagon radar */}
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

        {/* RIGHT — longship + tally */}
        <div className="lg:pl-8 flex flex-col">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Your standing
          </p>
          <div className="mt-7">
            <Longship size="hero" ariaLabel="Viking longship illustration" />
          </div>
          <div className="mt-8">
            <PercentileTally percentile={overallPercentile} width={420} />
          </div>
        </div>
      </div>

      {/* Embedded leaderboard — same data as the standalone page used
          to show, now inline below the dual column so the user can see
          their absolute scores AND their position in the cohort
          without leaving the dashboard. */}
      {leaderboardRows.length > 0 && (
        <div className="mt-12 pt-8 border-t border-ink/10">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Cohort leaderboard
          </p>
          <LeaderboardTable
            rows={leaderboardRows}
            tasks={leaderboardTasks}
            currentUserId={currentUserId}
          />
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-ink/10 space-y-2">
        <p className="text-[12px] leading-[1.55] text-muted">
          Computed from your best score per task, averaged across all
          completed tasks. Cohort size: {rankings.cohortSize}{" "}
          {rankings.cohortSize === 1 ? "student" : "students"}.
        </p>
        {rankings.isProvisional ? (
          <p className="text-[12px] leading-[1.55] italic text-oxblood">
            Provisional rankings. RuneShips is early; these refine as more
            students join. <FeedbackTrigger />
          </p>
        ) : (
          <p className="text-[12px] leading-[1.55] italic text-muted">
            <FeedbackTrigger />
          </p>
        )}
      </div>
    </div>
  );
}
