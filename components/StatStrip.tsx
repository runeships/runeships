import { Reveal } from "./Reveal";

// Placeholder figures — update when real waitlist + company numbers exist.
const STATS = [
  { value: "247", label: "Students on the waitlist" },
  { value: "12", label: "Companies posting pilot tasks" },
  { value: "8", label: "Skill categories ranked" },
] as const;

/**
 * Three large editorial numerals in a horizontal strip. Right-of-FT
 * pullout energy — big serif numbers, small caps labels below.
 * Numbers are placeholder until real metrics land.
 */
export function StatStrip() {
  return (
    <div>
      <p className="text-[10px] tracking-[0.2em] uppercase text-oxblood mb-10 sm:mb-12">
        Placeholder figures · refresh weekly once live
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-12 sm:gap-x-10 md:gap-x-16">
        {STATS.map((stat, i) => (
          <Reveal key={stat.value} mode="scroll" delay={i * 0.1}>
            <p
              className="font-display font-light leading-[1] text-ink tracking-[-0.025em]"
              style={{
                fontSize: "var(--text-stat)",
                fontVariationSettings: '"opsz" 144',
              }}
            >
              {stat.value}
            </p>
            <div className="mt-4 sm:mt-5 flex items-baseline gap-3">
              <span aria-hidden className="h-px w-8 bg-oxblood/60 self-center" />
              <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
