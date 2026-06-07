"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const SUBMISSION =
  "The fintech infrastructure market sits around $42B globally; our serviceable obtainable wedge — embedded payments for vertical SaaS — looks closer to $1.8B. Competitive landscape includes Stripe Treasury, Modern Treasury, and Mercury, but each occupies a distinct slice, and we believe there’s room for a vertical-specific offering targeting SaaS platforms with $1M–$10M ARR.";

const FEEDBACK =
  "Your TAM logic is strong, but the competitive positioning still reads generic. Add 2–3 differentiated axes and compare against specific fintech infrastructure competitors (Stripe Treasury, Modern Treasury, Mercury). Tighten the embedded-payments wedge into one sentence a partner could repeat from memory.";

/**
 * Interactive two-state preview sitting below the sample task card.
 * Toggles between a stand-in student submission and the AI feedback
 * response, 300ms crossfade. Gives a tactile sense of the product loop
 * without a real demo.
 */
export function FeedbackPreview() {
  const [showFeedback, setShowFeedback] = useState(false);
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? 0 : 0.3;

  return (
    <div className="border border-ink/15 bg-cream max-w-[820px]">
      <div className="px-6 sm:px-9 pt-6 sm:pt-7 pb-3.5">
        <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
          What the AI feedback looks like
        </p>
      </div>

      <div className="relative border-t border-rule">
        <div className="px-6 sm:px-9 py-8 sm:py-10 min-h-[220px]">
          <AnimatePresence mode="wait" initial={false}>
            {showFeedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <p className="text-[11px] tracking-[0.16em] uppercase text-oxblood mb-3.5">
                  AI feedback · within minutes
                </p>
                <p className="text-[15px] sm:text-[16px] leading-[1.65] italic text-oxblood max-w-[58ch]">
                  &ldquo;{FEEDBACK}&rdquo;
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="submission"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <p className="text-[11px] tracking-[0.16em] uppercase text-muted mb-3.5">
                  Your submission · excerpt
                </p>
                <p className="text-[15px] sm:text-[16px] leading-[1.65] text-ink/85 max-w-[58ch]">
                  {SUBMISSION}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 sm:px-9 py-4 sm:py-5 border-t border-rule">
        <button
          type="button"
          aria-pressed={showFeedback}
          onClick={() => setShowFeedback((s) => !s)}
          className="
            link-anim text-[14px] tracking-[0.01em] text-ink
            transition-colors duration-200 ease-out
            hover:text-oxblood focus-visible:text-oxblood
            focus-visible:outline-none
          "
        >
          {showFeedback ? (
            <>
              Show submission <span aria-hidden>↑</span>
            </>
          ) : (
            <>
              Show feedback <span aria-hidden>↓</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
