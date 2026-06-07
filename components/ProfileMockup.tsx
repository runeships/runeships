"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const SKILLS = [
  { name: "Strategy", top: 4 },
  { name: "Finance", top: 11 },
  { name: "Product", top: 18 },
  { name: "Marketing", top: 27 },
] as const;

/**
 * Sample student profile, rendered as an editorial paper panel — thin
 * border, cream-on-cream, no shadow. The ranks count up from 0 on mount
 * (200ms after hero text drift starts, 1000ms ease-out cubic).
 */
export function ProfileMockup() {
  return (
    <div
      role="img"
      aria-label="Sample student skill profile: S. Patel — Strategy Top 4%, Finance Top 11%, Product Top 18%, Marketing Top 27%, 7 tasks completed, 3 recruiter views."
      className="border border-ink/15 bg-cream p-7 sm:p-9"
    >
      <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
        Student profile · preview
      </p>
      <h3 className="mt-3 font-display font-normal text-[22px] sm:text-[24px] leading-[1.15] tracking-[-0.012em] text-ink">
        S. Patel&rsquo;s Skill Profile
      </h3>

      <dl className="mt-7 divide-y divide-rule">
        {SKILLS.map((skill, i) => (
          <div
            key={skill.name}
            className="flex items-baseline justify-between py-3.5"
          >
            <dt className="text-[15px] text-ink">{skill.name}</dt>
            <dd className="font-display text-[15px] tracking-[-0.005em] text-ink">
              Top <CountUp target={skill.top} delayMs={200 + i * 60} />%
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-[13px] tracking-[0.02em] text-muted">
        Tasks completed: 7
        <span aria-hidden className="mx-2 text-muted/60">·</span>
        Recruiter views: 3
      </p>

      <div className="mt-7 pt-6 border-t border-rule">
        <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
          Latest feedback
        </p>
        <p className="mt-3 text-[14px] leading-[1.55] italic text-ink/85">
          &ldquo;Strong market sizing logic. Weak competitive differentiation
          — add specific fintech infrastructure comparators.&rdquo;
        </p>
      </div>
    </div>
  );
}

/**
 * Animates a counter from 0 to `target` over `durationMs` with ease-out
 * cubic. Honors prefers-reduced-motion by jumping to the final value.
 * Uses raw requestAnimationFrame so we don't pull in motion's runtime
 * for a single integer counter.
 */
function CountUp({
  target,
  delayMs = 0,
  durationMs = 1000,
}: {
  target: number;
  delayMs?: number;
  durationMs?: number;
}) {
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let raf = 0;
    let startTime = 0;

    const tick = (now: number) => {
      if (!startTime) startTime = now + delayMs;
      const elapsed = now - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delayMs, durationMs, reducedMotion]);

  return <span className="tabular-nums">{value}</span>;
}
