import { type RankingsResult } from "@/lib/rankings";
import { Longship } from "@/components/Longship";

/**
 * Read-only "earned standing" surface on /profile (Profile tab).
 * A single medium-size longship filled to overallPercentile + the
 * "Top X% overall" line + cohort caption. When the user has no
 * feedback yet, a muted single-line prompt instead.
 */
export function EarnedStanding({ rankings }: { rankings: RankingsResult }) {
  const hasFeedback = rankings.overallPercentile !== null;

  return (
    <section className="mt-16 sm:mt-20">
      <div>
        <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.018em] text-ink">
          Your earned standing
        </h2>
        <hr className="mt-4 border-0 border-t border-ink/10" />
      </div>

      {!hasFeedback ? (
        <p className="mt-6 text-[14px] leading-[1.55] text-muted max-w-[58ch]">
          You haven&rsquo;t completed any tasks yet — submit one to see your
          earned standing.
        </p>
      ) : (
        <div className="mt-8 flex flex-col items-center text-center">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted self-start sm:self-auto">
            Your standing
          </p>
          <div className="mt-5 w-full flex justify-center">
            <Longship
              percentile={rankings.overallPercentile}
              ariaLabel={`Your overall longship — top ${Math.max(0, 100 - (rankings.overallPercentile ?? 0))}% overall.`}
              className="w-full max-w-[280px] min-w-[220px] aspect-[1485/763]"
            />
          </div>
          <p
            className="mt-6 font-display font-light leading-[1.05] tracking-[-0.018em] text-oxblood"
            style={{
              fontSize: "clamp(1.5rem, 1.6vw + 1rem, 1.85rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Top {Math.max(0, 100 - (rankings.overallPercentile ?? 0))}% overall
          </p>
          <p className="mt-2 text-[12px] tracking-[0.04em] text-muted">
            Across all five dimensions · cohort of {rankings.cohortSize}{" "}
            {rankings.cohortSize === 1 ? "student" : "students"}
          </p>
        </div>
      )}
    </section>
  );
}
