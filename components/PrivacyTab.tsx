import Link from "next/link";
import { FeedbackTrigger } from "@/components/FeedbackTrigger";

const LINKS: Array<{
  label: string;
  href: string;
  description: string;
  external?: boolean;
}> = [
  {
    label: "Privacy policy",
    href: "/privacy",
    description: "What we collect, how we use it, who we share it with.",
  },
  {
    label: "Cookie policy",
    href: "/cookies",
    description: "The small set of cookies we use, and why.",
  },
  {
    label: "Terms of service",
    href: "/terms",
    description: "The rules of the road for using RuneShips.",
  },
  {
    label: "Request a copy of your data",
    href: "mailto:hello@runeships.com?subject=Data%20export%20request",
    description: "Email us — we’ll send a complete export within 30 days.",
    external: true,
  },
];

/**
 * Privacy & Legal tab on /profile. Editorial list with hairline rules
 * between entries — no card containers per CLAUDE.md (this is an app
 * page, but the tab content is still a long-form editorial list).
 */
export function PrivacyTab() {
  return (
    <div className="max-w-[680px]">
      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {LINKS.map((l) => {
          const inner = (
            <div className="group flex items-baseline justify-between gap-6 py-7 -mx-3 px-3 transition-colors duration-200 ease-out hover:bg-parchment/60">
              <div className="min-w-0">
                <p className="font-display text-[20px] sm:text-[22px] leading-[1.2] tracking-[-0.012em] text-oxblood">
                  {l.label}
                </p>
                <p className="mt-2 text-[13px] leading-[1.55] text-muted max-w-[54ch]">
                  {l.description}
                </p>
              </div>
              <span
                aria-hidden
                className="text-oxblood text-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1 shrink-0"
              >
                →
              </span>
            </div>
          );
          return (
            <li key={l.label}>
              {l.external ? (
                <a href={l.href}>{inner}</a>
              ) : (
                <Link href={l.href}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-12 pl-6 sm:pl-8 border-l-2 border-ink/20 max-w-[60ch]">
        <p className="text-[14px] leading-[1.7] text-ink/80">
          RuneShips is operated by Diego Marjotie. Questions about privacy or
          your data can go to{" "}
          <a
            href="mailto:hello@runeships.com"
            className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            hello@runeships.com
          </a>{" "}
          — we&rsquo;ll respond within 30 days. You can request deletion or
          export of your data at any time.
        </p>
        <p className="mt-4 text-[14px] leading-[1.7] text-ink/80">
          For general product feedback, use <FeedbackTrigger />
        </p>
      </div>
    </div>
  );
}
