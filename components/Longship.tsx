"use client";

import { useId } from "react";
import { type Dimension, dimensionLabel } from "@/lib/rankings";

// Editorial palette — kept as literal RGB so SVG fill="rgb(…)" reads
// the same color as the rest of the page without depending on Tailwind
// arbitrary value resolution inside SVG attributes.
const OXBLOOD = "rgb(107 22 32)";
const PARCHMENT = "rgb(244 239 230)";

// Single source of truth for the silhouette geometry. Defined once and
// referenced via <use href="#…"> three times (parchment fill,
// oxblood-clipped fill, outline) so the path only travels the wire once
// per component instance.
const HULL_D =
  "M 22 30 C 14 30 14 42 22 44 C 26 46 28 52 32 58 L 168 58 C 172 56 176 50 180 40 C 184 38 184 44 182 50 C 178 56 174 60 170 64 C 130 94 70 94 30 64 C 24 58 20 52 22 30 Z";

const SHIELD_POSITIONS = [55, 78, 100, 122, 145];

type LongshipSize = "small" | "large" | "inline";

type LongshipSVGProps = {
  percentile: number | null;
  dimension: Dimension;
  width: number;
  height: number;
};

/**
 * Pure SVG variant of the longship — no card chrome, no labels. Used
 * inline next to the strongest-dimension row in the submission detail
 * score breakdown. Card variants below compose this.
 */
export function LongshipSVG({
  percentile,
  dimension,
  width,
  height,
}: LongshipSVGProps) {
  // useId works in both server and client components in React 18+. SVG
  // ids can't legally contain colons, so strip them.
  const baseId = useId().replace(/:/g, "_");
  const shipId = `ship-${baseId}`;
  const clipId = `clip-${baseId}`;

  const hasData = percentile !== null;
  // Fill rises from the bottom of the viewBox as percentile grows.
  // 75% percentile → bottom 90 units (75% of 120) are oxblood-filled.
  const fillHeight = hasData
    ? (Math.max(0, Math.min(100, percentile)) / 100) * 120
    : 0;
  const fillY = 120 - fillHeight;

  const dimName = dimensionLabel(dimension);
  const ariaLabel = hasData
    ? `${dimName} longship, filled to ${Math.max(0, 100 - percentile)} percent — top ${Math.max(0, 100 - percentile)}% of cohort`
    : `${dimName} longship, no data yet`;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className="overflow-visible block"
    >
      <defs>
        {/* All fillable parts grouped once. Outline circles get
            fill="none" applied via the outline <use> below — the
            base shapes don't carry their own fill. */}
        <g id={shipId}>
          <path d={HULL_D} />
          {/* Sail */}
          <rect x={70} y={15} width={60} height={38} />
          {/* Mast (thin vertical) */}
          <rect x={99.25} y={14} width={1.5} height={40} />
          {/* Shields along the deck */}
          {SHIELD_POSITIONS.map((cx) => (
            <circle key={cx} cx={cx} cy={56} r={2.5} />
          ))}
        </g>
        {hasData && (
          <clipPath id={clipId}>
            <rect
              x={0}
              y={fillY}
              width={200}
              height={fillHeight}
              style={{
                transition:
                  "y 600ms cubic-bezier(0.22, 0.61, 0.36, 1), height 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            />
          </clipPath>
        )}
      </defs>

      {/* Background parchment fill — only when there's data. When
          there's no data the silhouette renders as outline only,
          reading as "ship in port". */}
      {hasData && (
        <use href={`#${shipId}`} fill={PARCHMENT} stroke="none" />
      )}

      {/* Oxblood fill clipped to waterline — the percentile reading. */}
      {hasData && (
        <use
          href={`#${shipId}`}
          fill={OXBLOOD}
          stroke="none"
          clipPath={`url(#${clipId})`}
        />
      )}

      {/* Outline always last so it stays crisp over the fills. */}
      <use
        href={`#${shipId}`}
        fill="none"
        stroke={OXBLOOD}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

type LongshipProps = {
  percentile: number | null;
  dimension: Dimension;
  score: number | null;
  size?: LongshipSize;
  isStrongest?: boolean;
};

/**
 * Card variant — dimension label above, SVG ship, "TOP X%" + score
 * below. Used on the dashboard fleet row, the profile earned-standing
 * row, and the dashboard empty-state teaser.
 */
export function Longship({
  percentile,
  dimension,
  score,
  size = "small",
  isStrongest = false,
}: LongshipProps) {
  const hasData = percentile !== null;
  const displayTop = hasData ? Math.max(0, 100 - percentile) : null;
  const dimName = dimensionLabel(dimension);

  // Inline variant — no card chrome at all, just the SVG. Used in the
  // submission detail score breakdown.
  if (size === "inline") {
    return (
      <LongshipSVG
        percentile={percentile}
        dimension={dimension}
        width={56}
        height={34}
      />
    );
  }

  const shipWidth = size === "large" ? 160 : 90;
  const shipHeight = size === "large" ? 96 : 54;
  const topPctClass =
    size === "large"
      ? "font-display text-[24px] leading-[1.1] tracking-[-0.012em] tabular-nums"
      : "font-display text-[18px] leading-[1.1] tracking-[-0.012em] tabular-nums";

  return (
    <div
      className={`
        flex flex-col items-center text-center
        ${isStrongest ? "border-l-2 border-oxblood pl-3" : "pl-3 border-l-2 border-transparent"}
      `}
    >
      <p
        className={`
          text-[10px] tracking-[0.16em] uppercase
          ${isStrongest ? "text-oxblood pb-1 border-b border-oxblood" : "text-muted"}
        `}
      >
        {dimName}
      </p>

      <div className="mt-2.5">
        <LongshipSVG
          percentile={percentile}
          dimension={dimension}
          width={shipWidth}
          height={shipHeight}
        />
      </div>

      <div className="mt-2">
        {hasData ? (
          <>
            <p
              className={`${topPctClass} text-oxblood`}
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              TOP {displayTop}%
            </p>
            <p className="mt-1 text-[12px] text-muted">
              Score:{" "}
              <span className="text-ink tabular-nums">
                {score !== null ? Math.round(score) : "—"}
              </span>
            </p>
          </>
        ) : (
          <>
            <p
              className={`${topPctClass} text-ink/40`}
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              TOP —%
            </p>
            <p className="mt-1 text-[12px] text-muted">No data yet</p>
          </>
        )}
      </div>
    </div>
  );
}
