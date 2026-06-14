import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { getRankings } from "@/lib/rankings";
import { RadarChart } from "@/components/RadarChart";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Public verification page. Recruiters land here after scanning /
 *  typing the code printed on a RuneShips resume. Renders whatever
 *  the profile's *current* standing is — not a frozen snapshot from
 *  resume time. */
export default async function ResumeVerificationPage({
  params,
}: {
  params: Promise<{ resumeCode: string }>;
}) {
  const { resumeCode } = await params;
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id, full_name, school, graduation_year, last_resume_at, resume_code, is_seed",
    )
    .eq("resume_code", resumeCode.toLowerCase())
    .maybeSingle();

  // Treat seed accounts as "not found" so demo personas don't
  // leak as verifiable resumes.
  if (!profile || profile.is_seed) {
    return <NotFound code={resumeCode} />;
  }

  const rankings = await getRankings(profile.id);

  const { count: completedTaskCount } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);
  const taskCount = completedTaskCount ?? 0;

  const topPct =
    rankings.overallPercentile !== null
      ? Math.max(1, 100 - rankings.overallPercentile)
      : null;

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[600px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Verified
        </p>
        <h1
          className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.05] text-ink"
          style={{
            fontSize: "clamp(2rem, 3vw + 1rem, 2.6rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {profile.full_name ?? "Anonymous"}&rsquo;s RuneShips profile
        </h1>
        <p className="mt-5 text-[14px] leading-[1.55] text-muted">
          Verified directly from runeships.com — this resume is real.
        </p>

        <section className="mt-12 border border-ink/15 p-7 sm:p-9 bg-parchment/40">
          {topPct !== null ? (
            <p
              className="font-display font-light tracking-[-0.018em] leading-[1.05] text-oxblood"
              style={{ fontSize: "clamp(1.4rem, 1.8vw + 1rem, 1.9rem)" }}
            >
              Top {topPct}% on RuneShips
            </p>
          ) : (
            <p
              className="font-display font-light tracking-[-0.018em] leading-[1.05] text-ink"
              style={{ fontSize: "clamp(1.2rem, 1.6vw + 1rem, 1.6rem)" }}
            >
              Skill profile in progress
            </p>
          )}
          <p className="mt-3 text-[12px] tracking-[0.04em] uppercase text-muted">
            {[
              profile.school,
              profile.graduation_year ? `Class of ${profile.graduation_year}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          {/* Stats line */}
          <p className="mt-6 text-[13px] leading-[1.55] text-muted">
            {taskCount} task{taskCount === 1 ? "" : "s"} attempted
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            Cohort of {rankings.cohortSize.toLocaleString()}
            {profile.last_resume_at && (
              <>
                <span aria-hidden className="mx-2 text-muted/50">·</span>
                Resume last generated {timeAgo(profile.last_resume_at)}
              </>
            )}
          </p>

          {/* Radar */}
          <div className="mt-8 flex justify-center">
            <RadarChart
              size={260}
              values={{
                strategy: rankings.userAggregates.strategy ?? 0,
                execution: rankings.userAggregates.execution ?? 0,
                communication: rankings.userAggregates.communication ?? 0,
                technical: rankings.userAggregates.technical ?? 0,
                creativity: rankings.userAggregates.creativity ?? 0,
              }}
              percentiles={rankings.userPercentiles}
            />
          </div>
        </section>

        <p className="mt-8 text-[13px] leading-[1.6] text-muted max-w-[58ch]">
          RuneShips evaluates student work on real tasks across five
          dimensions. The percentile shown reflects this student&rsquo;s
          standing within the active RuneShips cohort as of the last resume
          generation. Resumes can be generated once per week.
        </p>

        <div className="mt-10 pt-8 border-t border-ink/10">
          <Link
            href="/proof"
            className="link-anim text-[14px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            Learn more about RuneShips <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function NotFound({ code }: { code: string }) {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[600px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Not found
        </p>
        <h1
          className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.05] text-ink"
          style={{
            fontSize: "clamp(1.8rem, 2.6vw + 1rem, 2.2rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          This code doesn&rsquo;t match a RuneShips profile.
        </h1>
        <p className="mt-5 text-[14px] leading-[1.6] text-muted max-w-[58ch]">
          The verification code <code className="text-ink">{code}</code> doesn&rsquo;t
          map to any active profile. Double-check the spelling — codes use
          lowercase letters and digits, with ambiguous characters (0/O, 1/l/I)
          excluded.
        </p>
        <div className="mt-10 pt-8 border-t border-ink/10">
          <Link
            href="/"
            className="link-anim text-[14px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </div>
    </main>
  );
}
