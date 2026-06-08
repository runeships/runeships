type RuneOpenerProps = {
  /** Single Elder Futhark rune character. */
  rune: string;
  /** Rune name in transliterated form (e.g. "Raidho"). */
  name: string;
  /** Short, evocative meaning (e.g. "journey, the path forward"). */
  meaning: string;
  className?: string;
};

/**
 * Editorial section opener: a single oxblood rune centered between two
 * hairline rules (~100–140px each side, ink/20). The rune drifts gently
 * (±2px y, 4s loop) so it doesn't read as orphan punctuation, and
 * scales 1.08× on hover/focus. The meaning tooltip below the rune
 * intensifies from ink/60 → ink/90 on hover (no theatrical animation —
 * just a calm 250ms color + opacity fade).
 *
 * The outer wrapper carries the float animation; the inner span carries
 * the hover scale, so the two transforms compose cleanly.
 */
export function RuneOpener({
  rune,
  name,
  meaning,
  className = "",
}: RuneOpenerProps) {
  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-8 ${className}`}>
      <span aria-hidden className="h-px w-[88px] sm:w-[140px] bg-ink/20" />
      <span className="rune-float">
        <span
          tabIndex={0}
          role="img"
          aria-label={`${name} — ${meaning}`}
          title={`${name} — ${meaning}`}
          className="
            relative group inline-block cursor-help outline-none
            font-rune text-oxblood
            text-[36px] sm:text-[48px] md:text-[56px] leading-none
            transition-transform duration-250 ease-out
            hover:scale-[1.08] focus-visible:scale-[1.08]
            focus-visible:ring-2 focus-visible:ring-oxblood/40 focus-visible:ring-offset-4
            focus-visible:ring-offset-cream
          "
        >
          {rune}
          <span
            aria-hidden
            className="
              absolute left-1/2 -translate-x-1/2 top-full mt-4 sm:mt-5
              whitespace-nowrap pointer-events-none
              font-display italic text-[13px] sm:text-[14px] tracking-[0.04em]
              text-ink/60
              opacity-0
              group-hover:opacity-100 group-focus-visible:opacity-100
              group-hover:text-ink/90 group-focus-visible:text-ink/90
              transition-[opacity,color] duration-250 ease-out
            "
          >
            {name} — {meaning}
          </span>
        </span>
      </span>
      <span aria-hidden className="h-px w-[88px] sm:w-[140px] bg-ink/20" />
    </div>
  );
}
