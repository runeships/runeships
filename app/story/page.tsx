import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Why this exists — RuneShips",
  description:
    "The founder story behind RuneShips: 40 rejected internships, the visibility problem, and the case for letting students prove the work directly.",
};

/**
 * Founder story — full version. Editorial article layout. Eight
 * numbered paragraph slots. Replace each `sketch` field with the real
 * copy when ready; the structure stays put.
 */
export default function StoryPage() {
  const paragraphs: { n: number; label: string; sketch: string }[] = [
    {
      n: 1,
      label: "The 40 internships",
      sketch:
        "What you applied to, why, what types of firms. The volume and the texture of those applications. The first signal that something was structurally off.",
    },
    {
      n: 2,
      label: "The two interviews",
      sketch:
        "The two résumé screens you made it past. What the interviewers actually said. The phrasing of being told you weren't qualified for the qualification.",
    },
    {
      n: 3,
      label: "Watching who got in",
      sketch:
        "The pattern in the people who did land internships. Parents at the firm. Target schools. On-campus recruiting that front-loaded the funnel. Visibility, not capability.",
    },
    {
      n: 4,
      label: "The realization",
      sketch:
        "Naming the problem clearly: the credential gate isn't a quality filter, it's a proxy for who got introduced to the right person early. What that means for everyone who's outside that funnel.",
    },
    {
      n: 5,
      label: "The insight that became RuneShips",
      sketch:
        "Work as proof. A way to demonstrate ability before being given the chance to demonstrate it. The moment this stopped being a complaint and started being a product idea.",
    },
    {
      n: 6,
      label: "Why now",
      sketch:
        "What's different about this moment. AI feedback at scale. Distribution through LinkedIn and university clubs. Why this couldn't have worked five years ago and won't be necessary in fifteen.",
    },
    {
      n: 7,
      label: "What RuneShips is and isn't",
      sketch:
        "It's not a job board, not a course platform, not an AI tutor. It's a portable, work-tested skill rank. State what we will and won't do — the discipline matters.",
    },
    {
      n: 8,
      label: "The invitation",
      sketch:
        "What you're asking the reader to do. Sign up if you're a student. Post a pilot task if you're a company. Email me directly if you have something else to add.",
    },
  ];

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <Reveal mode="load" delay={0.05}>
          <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
            Founder note
          </p>
          <h1
            className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "var(--text-display)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Why this exists.
          </h1>
          <p className="mt-7 text-[14px] tracking-[0.02em] text-muted">
            By Diego Marjotie, founder
          </p>
        </Reveal>

        <Reveal mode="load" delay={0.20} className="mt-12 sm:mt-14">
          <div className="text-[17px] leading-[1.7] text-ink/85 space-y-10">
            {paragraphs.map((p) => (
              <section key={p.n}>
                <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood mb-3 tabular-nums">
                  <span className="font-display">{p.n}.</span>{" "}
                  <span>{p.label}</span>
                </p>
                <p className="italic text-muted">{p.sketch}</p>
              </section>
            ))}
          </div>
        </Reveal>

        <div className="mt-20 sm:mt-24 pt-10 border-t border-rule">
          <Link
            href="/"
            className="
              inline-flex items-center gap-1.5
              text-[14px] tracking-[0.01em] text-ink
              underline-offset-[5px] decoration-ink/30 hover:decoration-ink hover:underline
              transition-colors duration-200 ease-out
            "
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}
