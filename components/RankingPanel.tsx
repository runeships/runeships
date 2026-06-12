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
 * "Where you stand" dashboard hero. Three states based on the
 * rankings result:
 *   - No feedback yet → "Getting started" prompt
 *   - Cohort ≥ 25    → confident headline with the top dimension
 *   - Cohort < 25    → provisional copy
 */
export function RankingPanel({ rankings }: { rankings: RankingsResult }) {
  const hasFeedback = rankings.strongestDimension !== null;

  if (!hasFeedback) {
    return (
      <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Getting started
        </p>
        <p
          className="mt-4 font-display font-light leading-[1.15] tracking-[-0.018em] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.6vw + 1rem, 1.75rem)" }}
        >
          Submit your first task to see your percentile ranking across the
          five RuneShips dimensions.
        </p>
        <p className="mt-5 text-[14px] leading-[1.55] text-muted max-w-[60ch]">
          Your dashboard currently shows your self-rated baseline. Rankings
          come from real work.
        </p>
      </div>
    );
  }

  const strongest = rankings.strongestDimension!;
  const strongestPercentile = rankings.userPercentiles[strongest] ?? 0;
  const topPct = Math.max(0, 100 - strongestPercentile);

  return (
    <div className="border border-ink/15 bg-cream p-8 sm:p-10 rounded-[2px]">
      {/* Headline — confident vs provisional */}
      {rankings.isProvisional ? (
        <>
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
        </>
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

      <hr className="mt-8 border-0 border-t border-ink/10" />

      {/* Grid: 5-col → 2-col → 1-col */}
      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-6">
        {DIMENSIONS.map((d) => {
          const percentile = rankings.userPercentiles[d];
          const aggregate = rankings.userAggregates[d];
          const isStrongest = d === strongest;
          return (
            <li
              key={d}
              className={`
                ${isStrongest ? "border-l-2 border-oxblood pl-4" : "pl-4 border-l-2 border-transparent"}
              `}
            >
              <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
                {dimensionLabel(d)}
              </p>
              {percentile === null ? (
                <>
                  <p
                    className="mt-2 font-display font-light text-[28px] leading-[1] text-ink/40 tracking-[-0.012em]"
                    style={{ fontVariationSettings: '"opsz" 96' }}
                  >
                    —
                  </p>
                  <p className="mt-2 text-[12px] text-muted">No data yet</p>
                </>
              ) : (
                <>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[10px] tracking-[0.18em] uppercase text-oxblood">
                      Top
                    </span>
                    <span
                      className="font-display font-light text-[28px] leading-[1] text-oxblood tracking-[-0.012em] tabular-nums"
                      style={{ fontVariationSettings: '"opsz" 96' }}
                    >
                      {Math.max(0, 100 - percentile)}%
                    </span>
                  </p>
                  <p className="mt-2 text-[13px] tracking-[-0.005em] text-muted">
                    Score:{" "}
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
