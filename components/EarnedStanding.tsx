import {
  type Dimension,
  type RankingsResult,
  dimensionLabel,
} from "@/lib/rankings";

const DIMENSIONS: Dimension[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

/**
 * Condensed read-only "earned standing" row for /profile (Profile
 * tab). Five small cells with percentile + aggregate. When the user
 * has no feedback, renders a single muted line instead.
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
          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-5">
            {DIMENSIONS.map((d) => {
              const percentile = rankings.userPercentiles[d];
              const aggregate = rankings.userAggregates[d];
              return (
                <li
                  key={d}
                  className="min-h-[80px] border-l-2 border-ink/10 pl-3"
                >
                  <p className="text-[10px] tracking-[0.16em] uppercase text-muted">
                    {dimensionLabel(d)}
                  </p>
                  {percentile === null ? (
                    <p
                      className="mt-1.5 font-display text-[20px] leading-[1] text-ink/40 tracking-[-0.012em]"
                      style={{ fontVariationSettings: '"opsz" 96' }}
                    >
                      —
                    </p>
                  ) : (
                    <>
                      <p className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-[9px] tracking-[0.18em] uppercase text-oxblood">
                          Top
                        </span>
                        <span
                          className="font-display text-[20px] leading-[1] text-oxblood tracking-[-0.012em] tabular-nums"
                          style={{ fontVariationSettings: '"opsz" 96' }}
                        >
                          {Math.max(0, 100 - percentile)}%
                        </span>
                      </p>
                      <p className="mt-1.5 text-[11px] text-muted">
                        Score{" "}
                        <span className="text-ink tabular-nums">
                          {aggregate !== null ? Math.round(aggregate) : "—"}
                        </span>
                      </p>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
