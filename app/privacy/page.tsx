import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Privacy — RuneShips",
  description: "Privacy policy for RuneShips.",
};

export default function PrivacyPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <Reveal mode="load" delay={0.05}>
          <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
            Privacy
          </p>
          <h1
            className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "var(--text-display)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Privacy policy.
          </h1>
        </Reveal>

        <Reveal mode="load" delay={0.20} className="mt-10">
          <p className="text-[17px] leading-[1.7] text-ink/85">
            Privacy policy coming soon. We don&rsquo;t sell your data.
            Questions:{" "}
            <a
              href="mailto:hello@runeships.com"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              hello@runeships.com
            </a>
            .
          </p>
        </Reveal>

        <div className="mt-20 sm:mt-24 pt-10 border-t border-rule">
          <Link
            href="/"
            className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}
