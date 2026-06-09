"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type RuneOpenerProps = {
  /** Single Elder Futhark rune character. */
  rune: string;
  /** Rune name in transliterated form (e.g. "Raidho"). */
  name: string;
  /** Short, evocative meaning (e.g. "journey, the path forward"). */
  meaning: string;
  className?: string;
  /**
   * Color scheme for the meaning line + hairlines.
   *  light — ink text on cream/parchment (default)
   *  dark  — cream text on the ink-bg Closing section
   */
  variant?: "light" | "dark";
  /** ms to auto-show the meaning tip on first viewport entry. */
  autoShowMs?: number;
};

/**
 * Editorial section opener: a single oxblood rune centered between two
 * hairline rules. The rune drifts gently (±2px y, 4s loop), scales 1.08×
 * on hover/focus, and reveals an italic meaning line below.
 *
 * Hover behavior: the entire opener (rune + both hairlines) is the
 * trigger — hovering anywhere over the cluster reveals the meaning.
 *
 * Scroll behavior: the first time the opener enters the viewport, the
 * meaning auto-shows for a few seconds so the visitor sees what the
 * rune means without needing to discover hover. After the auto-show
 * window expires, the tip is only visible on hover/focus.
 */
export function RuneOpener({
  rune,
  name,
  meaning,
  className = "",
  variant = "light",
  autoShowMs = 3000,
}: RuneOpenerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [autoShowing, setAutoShowing] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    setAutoShowing(true);
    // Honor reduced-motion by collapsing the show window: still show, but
    // briefly enough not to feel like an active effect.
    const ms = reducedMotion ? Math.min(autoShowMs, 1500) : autoShowMs;
    const t = window.setTimeout(() => setAutoShowing(false), ms);
    return () => window.clearTimeout(t);
  }, [inView, autoShowMs, reducedMotion]);

  const dark = variant === "dark";
  const lineColor = dark ? "bg-cream/30" : "bg-ink/20";
  const tipBase = dark ? "text-cream/75" : "text-ink/60";
  const tipHover = dark
    ? "group-hover:text-cream group-focus-within:text-cream"
    : "group-hover:text-ink/90 group-focus-within:text-ink/90";
  const focusRingOffset = dark
    ? "focus-visible:ring-offset-ink"
    : "focus-visible:ring-offset-cream";

  return (
    <div
      ref={ref}
      className={`group relative flex items-center justify-center gap-6 sm:gap-8 ${className}`}
    >
      <span aria-hidden className={`h-px w-[88px] sm:w-[140px] ${lineColor}`} />

      <span className="rune-float">
        <span
          tabIndex={0}
          role="img"
          aria-label={`${name} — ${meaning}`}
          title={`${name} — ${meaning}`}
          className={`
            inline-block cursor-help outline-none
            font-rune text-oxblood
            text-[36px] sm:text-[48px] md:text-[56px] leading-none
            transition-transform duration-250 ease-out
            group-hover:scale-[1.08] focus-visible:scale-[1.08]
            focus-visible:ring-2 focus-visible:ring-oxblood/40 focus-visible:ring-offset-4
            ${focusRingOffset}
          `}
        >
          {rune}
        </span>
      </span>

      <span aria-hidden className={`h-px w-[88px] sm:w-[140px] ${lineColor}`} />

      {/* Meaning line — fades in on hover/focus and during the auto-show
          window after the opener first enters the viewport. */}
      <span
        aria-hidden
        className={`
          absolute left-1/2 -translate-x-1/2 top-full mt-4 sm:mt-5
          whitespace-nowrap pointer-events-none
          font-display italic text-[13px] sm:text-[14px] tracking-[0.04em]
          transition-[opacity,color] duration-300 ease-out
          ${autoShowing ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}
          ${tipBase}
          ${tipHover}
        `}
      >
        {name} — {meaning}
      </span>
    </div>
  );
}
