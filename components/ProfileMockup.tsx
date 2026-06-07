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
 * border, cream-on-cream, hairline shadow on hover. Percentile numbers
 * are big (Financial Times pullout energy), with "Top" set as a small
 * caps kicker above each. Numbers count up on mount (1000ms ease-out
 * cubic, staggered).
 */
export function ProfileMockup() {
  return (
    <div
      role="img"
      aria-label="Sample student skill profile: S. Patel — Strategy Top 4%, Finance Top 11%, Product Top 18%, Marketing Top 27%, 7 tasks completed, 3 recruiter views."
      className="
        group/profile
        border border-ink/15 bg-cream
        p-7 sm:p-9
        transition-[box-shadow,border-color] duration-200 ease-out
        hover:border-ink/30
        hover:[box-shadow:0_1px_0_rgb(23_21_20/0.08),1px_0_0_rgb(23_21_20/0.08)]
      "
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
            className="
              flex items-end justify-between gap-6 py-4
              -mx-2 px-2 rounded-none
              transition-colors duration-150 ease-out
              hover:bg-parchment
            "
          >
            <dt className="text-[15px] text-ink pb-1">{skill.name}</dt>
            <dd className="text-right">
              <span className="block text-[10px] tracking-[0.18em] uppercase text-muted leading-none mb-1.5">
                Top
              </span>
              <span
                className="font-display font-light leading-[0.95] text-ink tracking-[-0.022em]"
                style={{
                  fontSize: "clamp(2.25rem, 2.8vw + 0.5rem, 2.75rem)",
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                <CountUp target={skill.top} delayMs={200 + i * 70} />
                <span className="text-[18px] sm:text-[20px] ml-0.5 text-ink/80">
                  %
                </span>
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-center gap-2.5">
        <span aria-hidden className="inline-block w-2 h-2 rounded-full bg-oxblood live-dot" />
        <p className="text-[13px] tracking-[0.02em] text-muted">
          Tasks completed: <span className="text-ink">7</span>
          <span aria-hidden className="mx-2 text-muted/60">·</span>
          Recruiter views: <span className="text-ink">3</span>
        </p>
      </div>

      <div className="mt-7 pt-6 border-t border-rule">
        <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
          Latest feedback
        </p>
        <p className="mt-3 text-[14px] leading-[1.6] italic text-ink/85">
          &ldquo;Strong market sizing logic. Weak competitive differentiation
          — add specific fintech infrastructure comparators.&rdquo;
        </p>
      </div>

      <div className="mt-7 pt-5 border-t border-rule flex justify-end">
        <a
          href="#"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          className="
            link-anim text-[13px] tracking-[0.01em] text-oxblood
            hover:text-oxblood-hover transition-colors duration-200 ease-out
          "
        >
          See full profile <span aria-hidden>→</span>
        </a>
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delayMs, durationMs, reducedMotion]);

  return <span className="tabular-nums">{value}</span>;
}
