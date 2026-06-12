"use client";

import { motion, useReducedMotion } from "motion/react";

type PercentileTallyProps = {
  /** 0–100, or null for "not yet ranked" (muted track, no marker). */
  percentile: number | null;
  /** Maximum width in px. Component is w-full inside that max. */
  width?: number;
  /** Show the "Top X% overall" + caption block beneath the tally. */
  showLabel?: boolean;
};

const MINOR_POSITIONS = [10, 20, 30, 40, 60, 70, 80, 90];
const MAJOR_POSITIONS = [0, 25, 50, 75, 100];
const ALL_MARKS: Array<{ pos: number; isMajor: boolean }> = [
  ...MAJOR_POSITIONS.map((pos) => ({ pos, isMajor: true })),
  ...MINOR_POSITIONS.map((pos) => ({ pos, isMajor: false })),
].sort((a, b) => a.pos - b.pos);

// Three-stop gradient: deep oxblood → brand oxblood → evaporating
// warm near-white. Captured as a single string so the animated
// motion.div doesn't recompute it.
const FILL_GRADIENT =
  "linear-gradient(to right, #3D0F18 0%, var(--color-oxblood) 50%, #F2E0DE 100%)";

const TRACK_HEIGHT = 6;
const MARKER_HEIGHT = 16;
const EASE_OUT_QUART: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Horizontal percentile tally line.
 *
 * Track: 6px tall, rounded ends. The filled segment (0 → user
 * percentile) renders a three-stop gradient — deep oxblood
 * sweeping through brand oxblood into a near-parchment that
 * "evaporates" at the user's position. The remainder shows as a
 * muted hairline.
 *
 * Marks overlay the track: 5 major at 0/25/50/75/100, 8 minor in
 * between. A composite marker (top dot + vertical line + bottom
 * triangle) sits at the user's exact percentile.
 *
 * Mount animation sweeps the fill from 0% to percentile% over 1.4s
 * with the marker fading in + sliding alongside. Respects
 * prefers-reduced-motion via useReducedMotion.
 */
export function PercentileTally({
  percentile,
  width = 420,
  showLabel = true,
}: PercentileTallyProps) {
  const reducedMotion = useReducedMotion();
  const hasData = percentile !== null;
  const fillPct = hasData ? Math.max(0, Math.min(100, percentile)) : 0;
  const topPct = Math.max(0, 100 - fillPct);

  // motion.div's initial=false means "render at the animated state
  // without playing the entry animation" — the cleanest way to
  // respect reduced motion without branching JSX.
  const fillInitial = reducedMotion ? false : { width: "0%" };
  const markerInitial = reducedMotion
    ? false
    : { opacity: 0, left: "0%" };

  return (
    <div className="mx-auto w-full" style={{ maxWidth: width }}>
      {/* Tally track. px-1 reserves room for the marker triangle and
          edge labels so they don't clip at 0% / 100%. */}
      <div className="relative px-1" style={{ height: 32 }}>
        <div className="relative h-full">
          {/* Muted base hairline — sits behind everything else. The
              gradient fill covers it on the left; on the right it
              remains visible as the "empty scale" indicator. */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
            style={{
              height: 1,
              background: "rgba(23, 21, 20, 0.15)",
              zIndex: 1,
            }}
          />

          {/* Gradient fill ribbon. */}
          {hasData && (
            <motion.div
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{
                height: TRACK_HEIGHT,
                borderRadius: 3,
                background: FILL_GRADIENT,
                zIndex: 2,
              }}
              initial={fillInitial}
              animate={{ width: `${fillPct}%` }}
              transition={{
                duration: reducedMotion ? 0 : 1.4,
                ease: EASE_OUT_QUART,
              }}
            />
          )}

          {/* Tally marks — always sit ABOVE the track so they
              remain visible against both the gradient and the
              hairline. */}
          {ALL_MARKS.map(({ pos, isMajor }) => (
            <div
              key={pos}
              aria-hidden
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{
                left: `${pos}%`,
                width: isMajor ? 1.5 : 1,
                height: isMajor ? 10 : 6,
                background: isMajor
                  ? "rgba(23, 21, 20, 0.6)"
                  : "rgba(23, 21, 20, 0.25)",
                zIndex: 3,
              }}
            />
          ))}

          {/* Position marker — composite dot + line + triangle. */}
          {hasData && (
            <motion.div
              aria-hidden
              className="absolute top-1/2"
              style={{
                height: MARKER_HEIGHT,
                marginTop: -MARKER_HEIGHT / 2,
                zIndex: 4,
              }}
              initial={markerInitial}
              animate={{ opacity: 1, left: `${fillPct}%` }}
              transition={{
                duration: reducedMotion ? 0 : 1.4,
                ease: EASE_OUT_QUART,
              }}
            >
              {/* Vertical line — the spine of the marker. */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-oxblood"
                style={{ top: 0, width: 2, height: MARKER_HEIGHT }}
              />
              {/* Top dot. */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-oxblood rounded-full"
                style={{ top: -3, width: 5, height: 5 }}
              />
              {/* Bottom triangle, points up. */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: -4,
                  width: 0,
                  height: 0,
                  borderLeft: "3px solid transparent",
                  borderRight: "3px solid transparent",
                  borderBottom: "4px solid var(--color-oxblood)",
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Major-mark labels. 12px breathing room above. */}
      <div className="relative px-1 mt-3 h-3">
        <div className="relative">
          {MAJOR_POSITIONS.map((pos) => (
            <span
              key={pos}
              className="absolute -translate-x-1/2 text-[10px] tracking-[0.04em] uppercase tabular-nums"
              style={{
                left: `${pos}%`,
                top: 0,
                color: "rgba(23, 21, 20, 0.5)",
              }}
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
