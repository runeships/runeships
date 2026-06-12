import Link from "next/link";
import { RadarChart, type RadarValues } from "./RadarChart";

/**
 * Hardcoded sample profile used as the hero-right editorial mockup.
 * Asymmetric on purpose — different scores make the polygon shape
 * obviously non-regular, which previews what a real student profile
 * looks like.
 */
const SAMPLE_VALUES: RadarValues = {
  strategy: 78,
  execution: 65,
  communication: 82,
  technical: 71,
  creativity: 58,
};

/**
 * Sample student profile shown next to the hero. Static — no count-up,
 * no scroll animation, no interactivity beyond the "See full profile"
 * link that funnels into /login.
 */
export function ProfileMockup() {
  return (
    <div
      role="img"
      aria-label="Sample student skill profile across five dimensions: Strategy 78, Execution 65, Communication 82, Technical 71, Creativity 58. Tasks completed: 7. Recruiter views: 3."
      className="
        border border-ink/15 bg-cream
        p-6 sm:p-8
        transition-[box-shadow,border-color] duration-200 ease-out
        hover:border-ink/30
        hover:[box-shadow:0_1px_0_rgb(23_21_20/0.08),1px_0_0_rgb(23_21_20/0.08)]
      "
    >
      <p className="text-[11px] tracking-[0.20em] uppercase text-muted">
        Sample student profile
      </p>
      <h3 className="mt-3 font-display font-normal text-[26px] sm:text-[28px] leading-[1.15] tracking-[-0.014em] text-ink">
        S. Patel&rsquo;s Skill Profile
      </h3>

      <div className="mt-6 sm:mt-7 flex justify-center">
        <RadarChart values={SAMPLE_VALUES} size={300} />
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        <span
          aria-hidden
          className="inline-block w-2 h-2 rounded-full bg-oxblood live-dot"
        />
        <p className="text-[13px] tracking-[0.02em] text-muted">
          Tasks completed: <span className="text-ink">7</span>
          <span aria-hidden className="mx-2 text-muted/60">·</span>
          Recruiter views: <span className="text-ink">3</span>
        </p>
      </div>

      <div className="mt-7 pt-6 border-t border-rule">
        <p className="text-[11px] tracking-[0.20em] uppercase text-muted">
          Latest feedback
        </p>
        <p className="mt-3 text-[14px] leading-[1.6] italic text-ink/85">
          &ldquo;Strong market sizing logic. Weak competitive differentiation
          — add specific fintech infrastructure comparators.&rdquo;
        </p>
      </div>

      <div className="mt-7 pt-5 border-t border-rule flex justify-end">
        <Link
          href="/login"
          className="
            link-anim text-[13px] tracking-[0.01em] text-muted
            hover:text-oxblood
            transition-colors duration-200 ease-out
          "
        >
          See full profile <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
