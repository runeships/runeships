import Link from "next/link";
import { timeAgo } from "@/lib/format";

/** Profile tab section showing the user's verification status:
 *  - never generated → explain when to use the button
 *  - has code → verification code + link to /v/[code] + last
 *    generated relative timestamp */
export function ResumeSection({
  lastResumeAt,
  resumeCode,
}: {
  lastResumeAt: string | null;
  resumeCode: string | null;
}) {
  return (
    <section className="mt-16 sm:mt-20 pt-10 border-t border-ink/10">
      <header>
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          CV bullet
        </p>
        <h2
          className="mt-3 font-display font-light tracking-[-0.018em] leading-[1.05] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.4vw + 1rem, 1.75rem)" }}
        >
          Add RuneShips to your CV
        </h2>
      </header>

      {!resumeCode ? (
        <p className="mt-6 text-[14px] leading-[1.6] text-muted max-w-[58ch]">
          Use the{" "}
          <Link
            href="/cv-builder"
            className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            CV builder
          </Link>{" "}
          to pick which tasks to feature and generate a paste-ready block for
          your existing CV. It includes a verification link recruiters can use
          to confirm your RuneShips standing.
        </p>
      ) : (
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-6 max-w-[640px]">
          <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Verification code
          </dt>
          <dd className="text-[14px] tracking-[-0.005em] text-ink font-mono">
            {resumeCode}
          </dd>

          {lastResumeAt && (
            <>
              <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
                Last generated
              </dt>
              <dd className="text-[14px] tracking-[-0.005em] text-ink">
                {timeAgo(lastResumeAt)}
              </dd>
            </>
          )}

          <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Public verification page
          </dt>
          <dd>
            <Link
              href={`/v/${resumeCode}`}
              className="link-anim text-[14px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              View your verification page <span aria-hidden>→</span>
            </Link>
          </dd>
        </dl>
      )}

      <p className="mt-7 text-[12px] leading-[1.6] text-muted max-w-[58ch]">
        Regenerate the bullet anytime; it always reflects your current
        standing. The verification URL stays the same so a CV in circulation
        still works.
      </p>
    </section>
  );
}
