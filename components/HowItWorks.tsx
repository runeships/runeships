import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    title: "Pick a real company task",
    body:
      "Choose from strategy, finance, marketing, product, or research challenges posted by actual companies.",
  },
  {
    n: "02",
    title: "Submit your work",
    body:
      "Use any tools you want — including AI. What matters is the final thinking.",
  },
  {
    n: "03",
    title: "Earn feedback and rank",
    body:
      "Get written feedback in minutes. Build a public skill profile recruiters can search.",
  },
] as const;

/**
 * Three-step explainer. Horizontal grid on desktop, snap-scroll carousel
 * on mobile. Each step fades in on scroll with a 150ms stagger.
 */
export function HowItWorks() {
  return (
    <div
      className="
        flex overflow-x-auto snap-x snap-mandatory gap-6 -mx-6 px-6 pb-2
        lg:grid lg:grid-cols-3 lg:gap-x-12 lg:gap-y-0 lg:mx-0 lg:px-0
        lg:overflow-visible lg:snap-none
      "
    >
      {STEPS.map((step, i) => (
        <Reveal
          key={step.n}
          mode="scroll"
          delay={i * 0.15}
          className="snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-auto"
        >
          <p
            className="font-display text-[44px] sm:text-[52px] leading-[1] text-oxblood tracking-[-0.01em]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {step.n}
          </p>
          <h3 className="mt-5 font-display font-normal text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.014em] text-ink">
            {step.title}
          </h3>
          <p className="mt-3 text-[15px] sm:text-[16px] leading-[1.6] text-ink/80 max-w-[36ch]">
            {step.body}
          </p>
        </Reveal>
      ))}
    </div>
  );
}
