import {
  type Dimension,
  type RankingsResult,
} from "@/lib/rankings";
import { Longship } from "@/components/Longship";

const DIMENSIONS: Dimension[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

/**
 * Read-only "earned standing" row on /profile (Profile tab). Five
 * small Longship cards — same visual language as the dashboard fleet.
 * When the user has no feedback, renders a single muted line.
 */
export function EarnedStanding({ rankings }: { rankings: RankingsResult }) {
  const hasFeedback = rankings.strongestDimension !== null;

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
        <>
          <p className="mt-6 text-[12px] tracking-[0.005em] text-muted">
            Read-only. Computed from your submissions.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-8">
            {DIMENSIONS.map((d) => (
              <Longship
                key={d}
                percentile={rankings.userPercentiles[d]}
                dimension={d}
                score={rankings.userAggregates[d]}
                size="small"
                isStrongest={d === rankings.strongestDimension}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
