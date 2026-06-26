import Link from "next/link";

type WordmarkProps = {
  /** Render size — tuned for editorial header vs. closing reprise. */
  size?: "sm" | "md" | "lg";
  /** Optional className passthrough for layout-level overrides. */
  className?: string;
  /** When true, wrap in a Link to "/". Defaults to true. */
  asLink?: boolean;
};

const SIZE_CLASS: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-[18px]",
  md: "text-[22px]",
  lg: "text-[28px]",
};

/**
 * Editorial text wordmark. Fraunces, italic-weighted figure for the "S",
 * tracked slightly tight to feel like a magazine masthead. No image asset.
 */
export function Wordmark({ size = "sm", className = "", asLink = true }: WordmarkProps) {
  const content = (
    <span
      className={`font-display font-medium tracking-[-0.01em] text-ink ${SIZE_CLASS[size]} ${className}`}
      style={{ fontVariationSettings: '"opsz" 14' }}
    >
      Rune<span className="italic">Ships</span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="inline-flex items-baseline" aria-label="RuneShips home">
      {content}
    </Link>
  );
}
