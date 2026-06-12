import Image from "next/image";

// Cropped silhouette is 1504×731 (aspect ≈ 2.057). Heights below are
// derived from those base widths so the rendered ratio matches the
// underlying file exactly — no stretch, no letterbox.
const SIZE_PRESETS = {
  hero: { width: 400, height: 195, maxClass: "max-w-[420px]" },
  medium: { width: 240, height: 117, maxClass: "max-w-[240px]" },
  small: { width: 120, height: 58, maxClass: "max-w-[120px]" },
} as const;

type LongshipSize = keyof typeof SIZE_PRESETS;

type LongshipProps = {
  size?: LongshipSize;
  ariaLabel?: string;
  /** Optional Tailwind classes added to the wrapper — typically for
   *  margins like "mt-8" or alignment overrides. */
  className?: string;
};

/**
 * Decoration-only longship. Brand anchor visual — no fill effect,
 * no recoloring, no mask. The PNG renders as-is via next/image
 * (native oxblood + ink palette baked into the source).
 *
 * Sizing presets:
 *   - hero    ~400px  — dashboard "Where you stand" hero
 *   - medium  ~240px  — profile earned-standing block
 *   - small   ~120px  — reserved for compact callouts (unused for now)
 *
 * The actual data visualization lives in `PercentileTally` below the
 * longship; the ship is purely the metaphor.
 */
export function Longship({
  size = "medium",
  ariaLabel = "Viking longship illustration",
  className = "",
}: LongshipProps) {
  const preset = SIZE_PRESETS[size];

  return (
    <div className={`${preset.maxClass} mx-auto w-full ${className}`}>
      <Image
        src="/brand/longship.png"
        alt={ariaLabel}
        width={preset.width}
        height={preset.height}
        className="w-full h-auto"
        priority={size === "hero"}
      />
    </div>
  );
}
