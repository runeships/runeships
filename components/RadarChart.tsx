"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT_QUART: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type RadarValues = {
  strategy: number;
  execution: number;
  communication: number;
  technical: number;
  creativity: number;
};

const DIMENSIONS = [
  "Strategy",
  "Execution",
  "Communication",
  "Technical",
  "Creativity",
] as const;

type RadarChartProps = {
  values: RadarValues;
  /** Total width/height of the SVG, including label padding. */
  size?: number;
  /** Hide axis labels (e.g. for a small thumbnail). */
  hideLabels?: boolean;
  /**
   * Optional second polygon — rendered BEHIND the primary, dashed
   * stroke + no fill. Used on the dashboard to overlay self-rated
   * scores under the earned scores.
   */
  compareValues?: RadarValues | null;
  /**
   * When true, the rounded value of each axis is rendered as a small
   * number beneath its label. Use on the submission detail page to
   * show "Strategy 78" at each vertex.
   */
  showScoreLabels?: boolean;
  /**
   * Per-vertex percentile rank. When provided, each axis label gets a
   * second line "TOP {100 - percentile}%" in small caps oxblood.
   * Null entries render as "—" to indicate no data for that dimension.
   */
  percentiles?: {
    strategy: number | null;
    execution: number | null;
    communication: number | null;
    technical: number | null;
    creativity: number | null;
  } | null;
};

/**
 * Pentagon radar chart for the 5 RuneShips skill dimensions.
 *
 * Cream background blends with the page, near-black grid at ~12%
 * opacity, oxblood polygon at 20% fill + full-opacity stroke. Updates
 * in real time as `values` change — re-renders on every slider tick
 * with no transition, since the slider drag itself is the animation.
 */
export function RadarChart({
  values,
  size = 280,
  hideLabels = false,
  compareValues = null,
  showScoreLabels = false,
  percentiles = null,
}: RadarChartProps) {
  const reducedMotion = useReducedMotion();
  // Shared style for the motion.g wrappers — sets the scale origin
  // to the SVG's geometric center so polygons expand outward from
  // the middle, not from the top-left of the bounding box.
  const scaleOriginStyle = useMemo(
    () => ({ transformOrigin: `${50}% ${50}%`, transformBox: "fill-box" as const }),
    [],
  );
  // Internal padding reserved for the axis labels. Bigger when labels
  // are shown so "CREATIVITY" / "COMMUNICATION" don't kiss the edge of
  // the SVG's bounding box (or the parent container's border).
  // Extra room when percentile sub-labels are shown — the second line
  // of text needs vertical breathing space on the top/bottom vertices.
  const padding = hideLabels ? 12 : percentiles ? 70 : 62;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;

  const orderedValues = useMemo(
    () => [
      values.strategy,
      values.execution,
      values.communication,
      values.technical,
      values.creativity,
    ],
    [values],
  );

  // 5 axes, starting at -90° (straight up) and rotating clockwise.
  const angles = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / 5),
    [],
  );

  // Filled value polygon
  const valuePath = useMemo(() => {
    return (
      angles
        .map((angle, i) => {
          const v = Math.min(100, Math.max(0, orderedValues[i])) / 100;
          const x = cx + radius * v * Math.cos(angle);
          const y = cy + radius * v * Math.sin(angle);
          return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ") + " Z"
    );
  }, [angles, orderedValues, cx, cy, radius]);

  // Optional comparison polygon (dashed, no fill).
  const compareOrdered = useMemo(
    () =>
      compareValues
        ? [
            compareValues.strategy,
            compareValues.execution,
            compareValues.communication,
            compareValues.technical,
            compareValues.creativity,
          ]
        : null,
    [compareValues],
  );

  const comparePath = useMemo(() => {
    if (!compareOrdered) return null;
    return (
      angles
        .map((angle, i) => {
          const v = Math.min(100, Math.max(0, compareOrdered[i])) / 100;
          const x = cx + radius * v * Math.cos(angle);
          const y = cy + radius * v * Math.sin(angle);
          return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ") + " Z"
    );
  }, [angles, compareOrdered, cx, cy, radius]);

  // Background grid: 4 concentric pentagons at 25/50/75/100% radius
  const gridPaths = useMemo(
    () =>
      [0.25, 0.5, 0.75, 1].map((level) =>
        angles
          .map((angle, i) => {
            const x = cx + radius * level * Math.cos(angle);
            const y = cy + radius * level * Math.sin(angle);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(" ") + " Z",
      ),
    [angles, cx, cy, radius],
  );

  // Axes — center to outer edge
  const axisLines = useMemo(
    () =>
      angles.map((angle) => ({
        x1: cx,
        y1: cy,
        x2: cx + radius * Math.cos(angle),
        y2: cy + radius * Math.sin(angle),
      })),
    [angles, cx, cy, radius],
  );

  // Per-dimension percentile values in axis order. Null preserves
  // "no data" semantics so the bottom-line can render "—".
  const orderedPercentiles = useMemo(
    () =>
      percentiles
        ? [
            percentiles.strategy,
            percentiles.execution,
            percentiles.communication,
            percentiles.technical,
            percentiles.creativity,
          ]
        : null,
    [percentiles],
  );

  // Labels — placed outside the outer pentagon
  const labels = useMemo(
    () =>
      angles.map((angle, i) => {
        const labelRadius = radius + 22;
        const x = cx + labelRadius * Math.cos(angle);
        const y = cy + labelRadius * Math.sin(angle);

        // Text alignment by angle: top/bottom use middle, sides use start/end.
        const cos = Math.cos(angle);
        const textAnchor: "middle" | "start" | "end" =
          Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";

        return { x, y, textAnchor, text: DIMENSIONS[i] };
      }),
    [angles, cx, cy, radius],
  );

  return (
    <svg
      role="img"
      aria-label="Self-rated skill profile across five dimensions"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Grid pentagons */}
      {gridPaths.map((d, i) => (
        <path
          key={`grid-${i}`}
          d={d}
          fill="none"
          stroke="rgb(23 21 20 / 0.10)"
          strokeWidth={1}
        />
      ))}

      {/* Axes */}
      {axisLines.map((line, i) => (
        <line
          key={`axis-${i}`}
          {...line}
          stroke="rgb(23 21 20 / 0.10)"
          strokeWidth={1}
        />
      ))}

      {/* Comparison polygon — drawn first so it sits BEHIND. Dashed,
          no fill. Animates outward from center after the earned
          polygon so the layered reveal reads naturally. */}
      {comparePath && (
        <motion.g
          style={scaleOriginStyle}
          initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 1.0,
            delay: reducedMotion ? 0 : 0.4,
            ease: EASE_OUT_QUART,
          }}
        >
          <path
            d={comparePath}
            fill="none"
            stroke="rgb(23 21 20 / 0.45)"
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeLinejoin="round"
          />
        </motion.g>
      )}

      {/* Earned polygon + its vertex dots. Both animate together so
          the dots stay glued to the polygon's corners. */}
      <motion.g
        style={scaleOriginStyle}
        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 1.2,
          delay: reducedMotion ? 0 : 0.1,
          ease: EASE_OUT_QUART,
        }}
      >
        <path
          d={valuePath}
          fill="rgb(107 22 32 / 0.22)"
          stroke="rgb(107 22 32)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {angles.map((angle, i) => {
          const v = Math.min(100, Math.max(0, orderedValues[i])) / 100;
          const x = cx + radius * v * Math.cos(angle);
          const y = cy + radius * v * Math.sin(angle);
          return (
            <circle
              key={`pt-${i}`}
              cx={x}
              cy={y}
              r={3}
              fill="rgb(107 22 32)"
            />
          );
        })}
      </motion.g>

      {/* Labels — fade in after polygons settle. Single motion.g
          wraps every label text element so the reveal feels unified. */}
      {!hideLabels && (
        <motion.g
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reducedMotion ? 0 : 0.5,
            delay: reducedMotion ? 0 : 1.0,
          }}
        >
          {labels.map((label, i) => (
          <g key={`label-${i}`}>
            <text
              x={label.x}
              y={label.y}
              textAnchor={label.textAnchor}
              dominantBaseline="middle"
              fontSize={11}
              fill="rgb(138 132 127)"
              style={{
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                fontFamily:
                  "var(--font-instrument, ui-sans-serif, system-ui, sans-serif)",
              }}
            >
              {label.text}
            </text>
            {showScoreLabels && (
              <text
                x={label.x}
                y={label.y + 16}
                textAnchor={label.textAnchor}
                dominantBaseline="middle"
                fontSize={13}
                fill="rgb(107 22 32)"
                style={{
                  fontFamily:
                    "var(--font-fraunces, Georgia, serif)",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                {Math.round(orderedValues[i])}
              </text>
            )}
            {orderedPercentiles && (
              <text
                x={label.x}
                y={label.y + (showScoreLabels ? 32 : 16)}
                textAnchor={label.textAnchor}
                dominantBaseline="middle"
                fontSize={10}
                fill="rgb(107 22 32)"
                style={{
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  fontFamily:
                    "var(--font-instrument, ui-sans-serif, system-ui, sans-serif)",
                }}
              >
                {orderedPercentiles[i] === null
                  ? "·"
                  : `Top ${Math.max(0, 100 - (orderedPercentiles[i] ?? 0))}%`}
              </text>
            )}
          </g>
          ))}
        </motion.g>
      )}
    </svg>
  );
}
