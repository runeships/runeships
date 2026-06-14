import Link from "next/link";
import { timeAgo } from "@/lib/format";
import {
  daysUntilNextResume,
  isInResumeCooldown,
} from "@/lib/resumeCode";

/** Profile tab section showing the user's resume status:
 *  - never generated → explain when to generate
 *  - has code + in cooldown → countdown + verification link
 *  - has code + ready → 'ready to regenerate' + verification link */
export function ResumeSection({
  lastResumeAt,
  resumeCode,
}: {
  lastResumeAt: string | null;
  resumeCode: string | null;
}) {
  const inCooldown = isInResumeCooldown(lastResumeAt);
  const daysLeft = daysUntilNextResume(lastResumeAt);

  return (
    <section className="mt-16 sm:mt-20 pt-10 border-t border-ink/10">
      <header>
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Resume
        </p>
        <h2
          className="mt-3 font-display font-light tracking-[-0.018em] leading-[1.05] text-ink"
          style={{ fontSize: "clamp(1.5rem, 1.4vw + 1rem, 1.75rem)" }}
        >
          Your RuneShips resume
        </h2>
      </header>

      {!resumeCode ? (
        <p className="mt-6 text-[14px] leading-[1.6] text-muted max-w-[58ch]">
          You haven&rsquo;t generated your RuneShips resume yet. Use the
          &ldquo;Convert to resume&rdquo; button in the navigation once
          you&rsquo;ve completed at least two tasks — that gives the resume
          enough data to mean something.
        </p>
      ) : (
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-6 max-w-[640px]">
          <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Verification code
          </dt>
          <dd className="text-[14px] tracking-[-0.005em] text-ink font-mono">
            {resumeCode}
          </dd>

          <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Last generated
          </dt>
          <dd className="text-[14px] tracking-[-0.005em] text-ink">
            {lastResumeAt ? timeAgo(lastResumeAt) : "—"}
          </dd>

          <dt className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Next available
          </dt>
          <dd className="text-[14px] tracking-[-0.005em] text-ink">
            {inCooldown
              ? `In ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
              : "Ready to regenerate"}
          </dd>

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
        Resumes can be generated once per week. Each PDF prints the same
        verification URL — recruiters can confirm the resume reflects an
        active profile at any time.
      </p>
    </section>
  );
}
