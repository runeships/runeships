/**
 * Sample task as a "premium editorial panel" — thin ink/15 border on
 * cream, generous interior padding, no shadows, no rounded corners.
 *
 * The "+120 XP" reward sits in its own inset on the right of the
 * metadata row, big serif numeral, so the reward reads as a real
 * scoreboard entry rather than a footnote.
 */
export function SampleTaskCard() {
  return (
    <article className="border border-ink/15 bg-cream">
      <div className="px-7 py-8 sm:px-12 sm:py-12">
        <p className="text-[12px] tracking-[0.18em] uppercase text-muted">
          Assignment 001 · Strategy
        </p>

        <h3
          className="mt-5 font-display font-normal leading-[1.12] tracking-[-0.014em] text-ink"
          style={{ fontSize: "clamp(1.55rem, 1.6vw + 1rem, 2rem)" }}
        >
          Pitch deck teardown: Series A SaaS, fintech vertical.
        </h3>

        <div className="prose-editorial mt-6 max-w-[62ch] text-[16px] sm:text-[17px] text-ink/85">
          <p>
            A B2B fintech company is preparing for a $12M Series A. Their
            current deck has a strong product story, but the market sizing
            slide undersells the TAM and the competitive positioning feels
            generic.
          </p>
          <p>
            Submit a revised deck, or a written critique, showing a tighter
            TAM/SAM/SOM breakdown, sharper competitive positioning, and a
            recommendation on the financial projections slide.
          </p>
        </div>

        <hr className="mt-10 border-0 border-t border-rule" />

        {/* Metadata row + reward inset, side by side on desktop */}
        <div className="mt-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-y-7 md:gap-x-10 items-start">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted flex flex-wrap gap-x-3 gap-y-2">
              <span>Time 3–5 hrs</span>
              <span aria-hidden className="text-muted/50">·</span>
              <span>Feedback ~5 min</span>
              <span aria-hidden className="text-muted/50">·</span>
              <span>Top submissions surfaced to recruiters</span>
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted">
              <span>Strategy</span>
              <span aria-hidden>·</span>
              <span>Finance</span>
              <span aria-hidden>·</span>
              <span>Product</span>
              <span aria-hidden>·</span>
              <span>Communication</span>
            </div>
          </div>

          {/* Reward inset — big serif numeral */}
          <div className="border-l border-rule pl-7 md:pl-10 md:min-w-[180px]">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted">
              Reward
            </p>
            <p
              className="mt-1 font-display font-light leading-[0.95] text-oxblood tracking-[-0.022em]"
              style={{
                fontSize: "clamp(2.5rem, 2.5vw + 1rem, 3rem)",
                fontVariationSettings: '"opsz" 144',
              }}
            >
              +120
            </p>
            <p className="mt-1.5 text-[11px] tracking-[0.18em] uppercase text-muted">
              Strategy XP
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
