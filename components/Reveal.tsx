"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Editorial-restrained reveal. Subtle upward drift + fade, ease-out cubic.
 * No spring, no bounce, no parallax — feels like a serious publication.
 *
 * Honors prefers-reduced-motion by rendering children without animation.
 */
type RevealProps = {
  children: ReactNode;
  /**
   * `load`   — animates on mount. Use for above-the-fold content (hero).
   * `scroll` — animates when scrolled into view. Use for below-the-fold sections.
   */
  mode?: "load" | "scroll";
  /** Stagger delay in seconds. */
  delay?: number;
  /** Initial translateY offset, in px. Defaults to 18. */
  y?: number;
  className?: string;
};

// Smooth, decelerating ease. No overshoot.
const EDITORIAL_EASE = [0.22, 0.61, 0.36, 1] as const;

export function Reveal({
  children,
  mode = "scroll",
  delay = 0,
  y = 18,
  className,
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = {
    duration: mode === "load" ? 0.85 : 0.75,
    delay,
    ease: EDITORIAL_EASE as unknown as [number, number, number, number],
  };

  if (mode === "load") {
    return (
      <motion.div
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
