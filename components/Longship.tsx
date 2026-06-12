import { type CSSProperties } from "react";

const SHIP_MASK_URL = "/brand/longship.png";

type LongshipProps = {
  /** 0–100, or null for "in port". */
  percentile: number | null;
  /** Accessible label — describing the dimension or overall standing. */
  ariaLabel: string;
  /**
   * Tailwind classes for sizing — typical use is
   * `w-full max-w-[480px] aspect-[1485/763] mx-auto`.
   * The mask + gradient stretch to fill whatever box you give them.
   */
  className?: string;
  /** Inline style overrides — handy when you need explicit pixel sizes
   *  (e.g. the 80px inline ship in the submission detail breakdown). */
  style?: CSSProperties;
};

/**
 * Single longship visualization. Fills horizontally from LEFT
 * (oxblood) to RIGHT (ink) based on percentile. Dragon head sits on
 * the right side of the silhouette — last thing to turn oxblood,
 * only at 100%.
 *
 * Implementation: a div whose background is a hard-stopped linear
 * gradient (oxblood at 0% → percentile%, ink at percentile% → 100%)
 * with the longship PNG used as a CSS mask. The mask's alpha channel
 * cuts the gradient into the ship silhouette; everything around the
 * ship stays fully transparent.
 *
 * The labels that used to live inside (TOP X%, dimension name, score)
 * now sit outside in the surrounding section layout — this component
 * is just the ship.
 */
export function Longship({
  percentile,
  ariaLabel,
  className,
  style,
}: LongshipProps) {
  const hasData = percentile !== null;
  const fillPct = hasData ? Math.max(0, Math.min(100, percentile)) : 0;

  // At 0% (or null) the entire div is ink — "ship in port". At 100%
  // the entire div is oxblood. In between, a hard stop at fillPct
  // gives a clean vertical waterline between the two colors.
  const background = hasData
    ? `linear-gradient(to right,
        var(--color-oxblood) 0%,
        var(--color-oxblood) ${fillPct}%,
        var(--color-ink) ${fillPct}%,
        var(--color-ink) 100%)`
    : "var(--color-ink)";

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
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
        ...style,
      }}
    />
  );
}
