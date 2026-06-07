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
 * Editorial section opener: a single rune in the oxblood accent, centered
 * between two hairline rules (~100px each side, ink/20). On hover or
 * keyboard focus a small italic tooltip reveals the rune's name and
 * meaning. No theatrical animation — fades in 200ms.
 */
export function RuneOpener({ rune, name, meaning, className = "" }: RuneOpenerProps) {
  return (
    <div className={`flex items-center justify-center gap-5 sm:gap-7 ${className}`}>
      <span aria-hidden className="h-px w-[72px] sm:w-[100px] bg-ink/20" />
      <span
        tabIndex={0}
        role="img"
        aria-label={`${name} — ${meaning}`}
        title={`${name} — ${meaning}`}
        className="
          relative group cursor-help outline-none
          font-rune text-oxblood
          text-[28px] sm:text-[32px] leading-none
          focus-visible:ring-2 focus-visible:ring-oxblood/40 focus-visible:ring-offset-4
          focus-visible:ring-offset-cream
        "
      >
        {rune}
        <span
          aria-hidden
          className="
            absolute left-1/2 -translate-x-1/2 top-full mt-3.5
            whitespace-nowrap pointer-events-none
            text-[12px] tracking-[0.02em] italic text-muted
            opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
            transition-opacity duration-200 ease-out
          "
        >
          {name} — {meaning}
        </span>
      </span>
      <span aria-hidden className="h-px w-[72px] sm:w-[100px] bg-ink/20" />
    </div>
  );
}
