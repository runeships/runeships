type PercentileTallyProps = {
  /** 0–100, or null for "not yet ranked" (muted track, no marker). */
  percentile: number | null;
  /** Maximum width in px. Component is w-full inside that max. */
  width?: number;
  /** Show the "Top X% overall" + caption block beneath the tally. */
  showLabel?: boolean;
};

// 11 minor positions at every-10% intervals + the 5 major positions
// (0, 25, 50, 75, 100). 25 and 75 don't appear in the every-10% set
// so we add them explicitly. Final order: 0, 10, 20, 25, 30, ...,
// 75, 80, 90, 100 — 13 marks total.
const MINOR_POSITIONS = [10, 20, 30, 40, 60, 70, 80, 90];
const MAJOR_POSITIONS = [0, 25, 50, 75, 100];
const ALL_MARKS: Array<{ pos: number; isMajor: boolean }> = [
  ...MAJOR_POSITIONS.map((pos) => ({ pos, isMajor: true })),
  ...MINOR_POSITIONS.map((pos) => ({ pos, isMajor: false })),
].sort((a, b) => a.pos - b.pos);

/**
 * Horizontal tally line + position marker visualization.
 *
 * Renders pure HTML/CSS (no SVG). The container's width drives every
 * absolute-positioned element via % units, so this scales cleanly
 * from a 200px inline marker to a 420px hero block.
 *
 * Visual structure (top→bottom):
 *   1. Tally track — base muted line, oxblood overlay from 0→pct%,
 *      13 tally marks (major @ 0/25/50/75/100 taller + bolder),
 *      triangle marker below pointing up at the percentile position
 *   2. Percentage labels under each major mark (0, 25%, 50%, 75%, 100%)
 *   3. Optional "Top X% overall" + caption block (showLabel)
 *
 * Null percentile renders a fully muted track with no marker and a
 * "Not yet ranked" prompt instead of the standing copy.
 */
export function PercentileTally({
  percentile,
  width = 420,
  showLabel = true,
}: PercentileTallyProps) {
  const hasData = percentile !== null;
  const fillPct = hasData ? Math.max(0, Math.min(100, percentile)) : 0;
  const topPct = Math.max(0, 100 - fillPct);

  return (
    <div
      className="mx-auto w-full"
      style={{ maxWidth: width }}
    >
      {/* Tally track. Inner padding so the marker triangle and edge
          labels don't get clipped at 0% / 100%. */}
      <div className="relative px-1" style={{ height: 32 }}>
        {/* Inner track region — all absolute positioning is relative
            to this so the % left values align with mark positions. */}
        <div className="relative h-full">
          {/* Base line (muted, full width). */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-ink/30" />

          {/* Oxblood fill segment (0 → percentile). Slightly thicker
              than the muted base line per spec. */}
          {hasData && fillPct > 0 && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-oxblood"
              style={{
                width: `${fillPct}%`,
                height: 2,
                transition:
                  "width 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            />
          )}

          {/* Tally marks. Major @ 0/25/50/75/100 stand taller + bolder. */}
          {ALL_MARKS.map(({ pos, isMajor }) => {
            const isFilled = hasData && pos <= fillPct;
            return (
              <div
                key={pos}
                aria-hidden
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{
                  left: `${pos}%`,
                  width: isMajor ? 2 : 1,
                  height: isMajor ? 10 : 6,
                  background: isFilled
                    ? "var(--color-oxblood)"
                    : "rgba(23, 21, 20, 0.4)",
                  transition: "background 400ms ease-out",
                }}
              />
            );
          })}

          {/* Position marker — triangle pointing up, 4px below line. */}
          {hasData && (
            <div
              aria-hidden
              className="absolute"
              style={{
                left: `${fillPct}%`,
                top: "calc(50% + 4px)",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "8px solid var(--color-oxblood)",
                transition: "left 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            />
          )}
        </div>
      </div>

      {/* Major-mark labels. Aligned via the same % positions. */}
      <div className="relative px-1 mt-2 h-3">
        <div className="relative">
          {MAJOR_POSITIONS.map((pos) => (
            <span
              key={pos}
              className="absolute -translate-x-1/2 text-[10px] tracking-[0.08em] uppercase text-muted tabular-nums"
              style={{ left: `${pos}%`, top: 0 }}
            >
              {pos === 0 ? "0" : `${pos}%`}
            </span>
          ))}
        </div>
      </div>

      {/* Headline + caption. */}
      {showLabel && (
        <div className="mt-8 text-center">
          {hasData ? (
            <>
              <p
                className="font-display font-light leading-[1.05] tracking-[-0.018em] text-oxblood"
                style={{
                  fontSize: "clamp(1.6rem, 1.8vw + 1rem, 2rem)",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                Top {topPct}% overall
              </p>
              <p className="mt-2 text-[12px] tracking-[0.04em] text-muted">
                Across the RuneShips cohort
              </p>
            </>
          ) : (
            <>
              <p
                className="font-display font-light leading-[1.05] tracking-[-0.018em] text-ink/60"
                style={{
                  fontSize: "clamp(1.6rem, 1.8vw + 1rem, 2rem)",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                Not yet ranked
              </p>
              <p className="mt-2 text-[12px] tracking-[0.04em] text-muted">
                Submit your first task to find your position.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
