import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Why this exists — RuneShips",
  description:
    "The founder story behind RuneShips: 40 rejected internships, the visibility problem, and the case for letting students prove the work directly.",
};

/**
 * Founder story — full version. Editorial article layout. Eight paragraph
 * slots, each labeled with the intended beat so the user can fill them in
 * later without losing the structure.
 */
export default function StoryPage() {
  // The intended beat for each paragraph. Replace each entry with the final
  // copy when ready — the bracketed text is what shows in-page so unfinished
  // sections are obvious during review.
  const paragraphs: { beat: string; sketch: string }[] = [
    {
      beat: "1 — The 40 internships",
      sketch:
        "What you applied to, why, what types of firms. The volume and the texture of those applications. The first signal that something was structurally off.",
    },
    {
      beat: "2 — The two interviews",
      sketch:
        "The two résumé screens you made it past. What the interviewers actually said. The phrasing of being told you weren't qualified for the qualification.",
    },
    {
      beat: "3 — Watching who got in",
      sketch:
        "The pattern in the people who did land internships. Parents at the firm. Target schools. On-campus recruiting that front-loaded the funnel. Visibility, not capability.",
    },
    {
      beat: "4 — The realization",
      sketch:
        "Naming the problem clearly: the credential gate isn't a quality filter, it's a proxy for who got introduced to the right person early. What that means for everyone who's outside that funnel.",
    },
    {
      beat: "5 — The insight that became RuneShips",
      sketch:
        "Work as proof. A way to demonstrate ability before being given the chance to demonstrate it. The moment this stopped being a complaint and started being a product idea.",
    },
    {
      beat: "6 — Why now",
      sketch:
        "What's different about this moment. AI feedback at scale. Distribution through LinkedIn and university clubs. Why this couldn't have worked five years ago and won't be necessary in fifteen.",
    },
    {
      beat: "7 — What RuneShips is and isn't",
      sketch:
        "It's not a job board, not a course platform, not an AI tutor. It's a portable, work-tested skill rank. State what we will and won't do — the discipline matters.",
    },
    {
      beat: "8 — The invitation",
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
          <div className="prose-editorial text-[17px] leading-[1.7] text-ink/85 space-y-7">
            {paragraphs.map((p, i) => (
              <p
                key={p.beat}
                className={
                  i === 0
                    ? "first-letter:font-display first-letter:text-[3.4rem] first-letter:leading-[0.8] first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-oxblood"
                    : ""
                }
              >
                <span className="block text-[11px] tracking-[0.16em] uppercase text-oxblood not-italic mb-2">
                  Paragraph {p.beat}
                </span>
                <span className="italic text-muted">[{p.sketch}]</span>
              </p>
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
