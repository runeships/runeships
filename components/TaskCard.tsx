/**
 * Sample task as a "premium editorial panel" — thin border, cream-on-cream,
 * generous interior padding. Deliberately NOT a glossy SaaS card: no
 * shadows, no rounded corners, no gradient backgrounds. The AI feedback
 * preview hangs below as an oxblood-ruled blockquote.
 */
export function TaskCard() {
  return (
    <>
      <article className="border border-ink/15 bg-cream px-7 py-8 sm:px-12 sm:py-12">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Assignment 001 · Strategy
        </p>

        <h3
          className="mt-5 font-display font-normal leading-[1.12] tracking-[-0.014em] text-ink"
          style={{ fontSize: "clamp(1.55rem, 1.6vw + 1rem, 2rem)" }}
        >
          Pitch deck teardown — Series A SaaS, fintech vertical.
        </h3>

        <div className="prose-editorial mt-6 max-w-[62ch] text-[16px] sm:text-[17px] leading-[1.65] text-ink/85">
          <p>
            A B2B fintech company is preparing for a $12M Series A. Their
            current deck has a strong product story but the market sizing
            slide undersells the TAM and the competitive positioning feels
            generic.
          </p>
          <p>
            Submit a revised deck (or a written critique) showing: a tighter
            TAM/SAM/SOM breakdown, sharper competitive positioning, and a
            recommendation on the financial projections slide.
          </p>
        </div>

        <hr className="mt-9 border-0 border-t border-rule" />

        <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-muted flex flex-wrap gap-x-3 gap-y-2">
          <span>Time 3–5 hrs</span>
          <span aria-hidden className="text-muted/50">·</span>
          <span>Feedback ~5 min</span>
          <span aria-hidden className="text-muted/50">·</span>
          <span>Reward +120 Strategy XP</span>
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
      </article>

      {/* AI feedback preview — below the card, oxblood rule, indented */}
      <div className="mt-8 sm:mt-10 max-w-[58ch] pl-6 sm:pl-8 border-l-2 border-oxblood">
        <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
          AI feedback preview
        </p>
        <p className="mt-2.5 text-[15px] sm:text-[16px] leading-[1.6] italic text-oxblood">
          &ldquo;Your TAM logic is strong, but the competitive positioning
          still reads generic. Add 2–3 differentiated axes and compare against
          specific fintech infrastructure competitors (Stripe Treasury, Modern
          Treasury, Mercury).&rdquo;
        </p>
      </div>
    </>
  );
}
