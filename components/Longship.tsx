import { type Dimension, dimensionLabel } from "@/lib/rankings";

// Path to the silhouette PNG used as a CSS mask. The PNG must have a
// transparent background (the silhouette stays, the rest goes clear)
// so mask-mode: alpha (the default) cuts the gradient into the ship
// shape and leaves everything around it untouched.
const SHIP_MASK_URL = "/brand/longship.png";

type LongshipSize = "small" | "large" | "inline";

type LongshipSVGProps = {
  percentile: number | null;
  dimension: Dimension;
  width: number;
  height: number;
};

/**
 * Longship silhouette filled to the given percentile.
 *
 * Implementation: a single <div> whose background is a hard-stopped
 * linear gradient (oxblood at bottom → parchment at top, split at the
 * percentile mark) clipped by a CSS mask of the longship PNG. The
 * oxblood "waterline" rises as the percentile grows.
 *
 * The legacy name `LongshipSVG` is preserved so existing imports keep
 * working — the implementation is no longer an SVG but the contract
 * (percentile-driven fill, given width/height, accessible label) is
 * identical.
 */
export function LongshipSVG({
  percentile,
  dimension,
  width,
  height,
}: LongshipSVGProps) {
  const hasData = percentile !== null;
  const fillPct = hasData
    ? Math.max(0, Math.min(100, percentile))
    : 0;

  const dimName = dimensionLabel(dimension);
  const ariaLabel = hasData
    ? `${dimName} longship, filled to ${Math.max(0, 100 - percentile)} percent — top ${Math.max(0, 100 - percentile)}% of cohort`
    : `${dimName} longship, no data yet`;

  // Hard-stopped gradient: rising oxblood waterline below, parchment
  // above. At 0% the whole thing is parchment ("ship in port"); at
  // 100% it's all oxblood; at 50% a clean half-and-half split.
  // Linear gradient handles the transition smoothness — the optional
  // CSS transition on the gradient stops is browser-supported and
  // gives the 600ms fill-rise animation on prop change.
  const background = hasData
    ? `linear-gradient(to top,
        var(--color-oxblood) 0%,
        var(--color-oxblood) ${fillPct}%,
        var(--color-parchment) ${fillPct}%,
        var(--color-parchment) 100%)`
    : "var(--color-parchment)";

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        background,
        WebkitMaskImage: `url(${SHIP_MASK_URL})`,
        maskImage: `url(${SHIP_MASK_URL})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        transition: "background 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
      }}
    />
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
 * Card variant — dimension label above, longship in the middle,
 * "TOP X%" + score below. Used on the dashboard fleet row, the
 * profile earned-standing row, and the dashboard empty-state teaser.
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

  // Inline variant — no card chrome at all, just the ship. Used in
  // the submission detail score breakdown.
  // Container dimensions match the cropped PNG aspect (≈1.946:1) so
  // the gradient's 0–100% mark exactly tracks the ship's visible
  // top and bottom — no gutter to throw off the waterline.
  if (size === "inline") {
    return (
      <LongshipSVG
        percentile={percentile}
        dimension={dimension}
        width={64}
        height={33}
      />
    );
  }

  const shipWidth = size === "large" ? 180 : 100;
  const shipHeight = size === "large" ? 92 : 51;
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
