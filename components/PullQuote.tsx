import { Reveal } from "./Reveal";

type PullQuoteProps = {
  children: React.ReactNode;
  /** Match surrounding background so the quote sits within the band. */
  bg?: "cream" | "parchment";
};

/**
 * Large editorial pull quote between sections. Centered italic serif,
 * hairline rules above (own border) + below (next section's border).
 * Generous vertical padding (~120px each side on desktop).
 */
export function PullQuote({ children, bg = "cream" }: PullQuoteProps) {
  const bgClass = bg === "parchment" ? "bg-parchment" : "bg-cream";

  return (
    <section
      className={`${bgClass} border-t border-oxblood/40`}
      aria-hidden={false}
    >
      <div className="mx-auto max-w-[1000px] px-6 sm:px-10 md:px-16 py-24 sm:py-32 md:py-36">
        <Reveal mode="scroll">
          <p
            className="font-display font-light italic text-center tracking-[-0.018em] leading-[1.1] text-ink"
            style={{
              fontSize: "var(--text-pull)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            <span aria-hidden className="text-oxblood/60 mr-1">&ldquo;</span>
            {children}
            <span aria-hidden className="text-oxblood/60 ml-1">&rdquo;</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
