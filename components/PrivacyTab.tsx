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
    description: "Email us and we’ll send a complete export within 30 days.",
    external: true,
  },
];

const ARBITRATION_WINDOW_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Privacy & Legal tab on /profile. Editorial list with hairline rules
 * between entries — no card containers per CLAUDE.md (this is an app
 * page, but the tab content is still a long-form editorial list).
 *
 * Shows the user's Terms acceptance timestamp and arbitration opt-out
 * window status (per Section 18.4 of the Terms — 30 days from
 * acceptance to opt out via email).
 */
export function PrivacyTab({
  termsAcceptedAt,
}: {
  termsAcceptedAt: string | null;
}) {
  let arbitrationStatus:
    | { kind: "no_accept" }
    | { kind: "open"; daysLeft: number }
    | { kind: "closed" };
  if (!termsAcceptedAt) {
    arbitrationStatus = { kind: "no_accept" };
  } else {
    const elapsed = Date.now() - new Date(termsAcceptedAt).getTime();
    const remaining = ARBITRATION_WINDOW_DAYS * MS_PER_DAY - elapsed;
    arbitrationStatus =
      remaining > 0
        ? { kind: "open", daysLeft: Math.ceil(remaining / MS_PER_DAY) }
        : { kind: "closed" };
  }

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

      {/* Terms acceptance status */}
      {termsAcceptedAt && (
        <p className="mt-10 text-[13px] leading-[1.6] text-muted">
          You accepted the current Terms on{" "}
          <span className="text-ink">{formatDate(termsAcceptedAt)}</span>.
        </p>
      )}

      {/* Arbitration opt-out block */}
      <section className="mt-8 pl-5 border-l-2 border-oxblood/40 max-w-[60ch]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          Arbitration opt-out
        </p>
        {arbitrationStatus.kind === "open" ? (
          <p className="mt-3 text-[14px] leading-[1.65] text-ink/85">
            To opt out of binding arbitration under our Terms of Service
            (within 30 days of accepting), email{" "}
            <a
              href="mailto:hello@runeships.com?subject=Arbitration%20Opt-Out"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              hello@runeships.com
            </a>{" "}
            with the subject{" "}
            <code className="text-[13px] text-ink font-mono">
              Arbitration Opt-Out
            </code>
            . You have{" "}
            <span className="text-oxblood font-medium">
              {arbitrationStatus.daysLeft} day
              {arbitrationStatus.daysLeft === 1 ? "" : "s"} left
            </span>{" "}
            in your opt-out window. See{" "}
            <Link
              href="/terms"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              Section 18 of the Terms
            </Link>{" "}
            for full details.
          </p>
        ) : arbitrationStatus.kind === "closed" ? (
          <p className="mt-3 text-[14px] leading-[1.65] text-muted">
            Your 30-day arbitration opt-out window has passed. See{" "}
            <Link
              href="/terms"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              Section 18 of the Terms
            </Link>{" "}
            for how disputes are resolved.
          </p>
        ) : (
          <p className="mt-3 text-[14px] leading-[1.65] text-muted">
            Once you finish onboarding and accept the current Terms, you&rsquo;ll
            have 30 days to opt out of binding arbitration by emailing{" "}
            <a
              href="mailto:hello@runeships.com?subject=Arbitration%20Opt-Out"
              className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              hello@runeships.com
            </a>
            .
          </p>
        )}
      </section>

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
          and we&rsquo;ll respond within 30 days. You can request deletion or
          export of your data at any time.
        </p>
        <p className="mt-4 text-[14px] leading-[1.7] text-ink/80">
          For general product feedback, use <FeedbackTrigger />
        </p>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
