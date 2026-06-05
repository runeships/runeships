type RuneMarkProps = {
  /** A single Elder Futhark rune character. */
  rune: string;
  /**
   * Human-readable semantic label for the rune (for screen readers and
   * for designer/reviewer context — not displayed).
   */
  label: string;
  className?: string;
};

/**
 * Small editorial section marker. A single rune, oxblood, used once per
 * section as a quiet kicker. Decorative only — exposed to assistive tech
 * via the label so the section header still reads cleanly.
 */
export function RuneMark({ rune, label, className = "" }: RuneMarkProps) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block font-display text-oxblood text-[20px] leading-none ${className}`}
    >
      {rune}
    </span>
  );
}
