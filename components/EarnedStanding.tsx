import { type RankingsResult } from "@/lib/rankings";
import { Longship } from "@/components/Longship";
import { PercentileTally } from "@/components/PercentileTally";

/**
 * Read-only "earned standing" surface on /profile (Profile tab).
 * Same medium longship + tally pairing as the dashboard, scaled
 * down. Single muted prompt when no feedback yet.
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
        <div className="mt-8">
          <Longship size="medium" ariaLabel="Viking longship illustration" />
          <div className="mt-8">
            <PercentileTally
              percentile={rankings.overallPercentile}
              width={320}
            />
          </div>
        </div>
      )}
    </section>
  );
}
