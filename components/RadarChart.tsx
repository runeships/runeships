"use client";

import { useMemo } from "react";

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
}: RadarChartProps) {
  const padding = hideLabels ? 12 : 40;
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

  // Labels — placed outside the outer pentagon
  const labels = useMemo(
    () =>
      angles.map((angle, i) => {
        const labelRadius = radius + 18;
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

      {/* Filled value polygon */}
      <path
        d={valuePath}
        fill="rgb(107 22 32 / 0.18)"
        stroke="rgb(107 22 32)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Value points */}
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

      {/* Labels */}
      {!hideLabels &&
        labels.map((label, i) => (
          <text
            key={`label-${i}`}
            x={label.x}
            y={label.y}
            textAnchor={label.textAnchor}
            dominantBaseline="middle"
            fontSize={10}
            fill="rgb(138 132 127)"
            style={{
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily:
                "var(--font-instrument, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {label.text}
          </text>
        ))}
    </svg>
  );
}
