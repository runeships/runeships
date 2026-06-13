import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getLeaderboard } from "@/lib/rankings";
import { LeaderboardTable } from "@/components/LeaderboardTable";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/leaderboard");

  const rows = await getLeaderboard();

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        {/* Header */}
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Cohort
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2.4rem, 4.4vw + 1rem, 3.75rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Leaderboard
        </h1>
        <p className="mt-5 font-display italic text-[17px] sm:text-[19px] leading-[1.5] text-muted max-w-[56ch]">
          Where you stand in the RuneShips cohort. Sort by overall, by
          dimension, or by activity.
        </p>

        {/* Filter chips + table */}
        <LeaderboardTable rows={rows} currentUserId={user.id} />

        {/* Footer caption */}
        <p className="mt-10 text-[13px] leading-[1.55] text-muted">
          {rows.length} {rows.length === 1 ? "student" : "students"} in the
          RuneShips cohort. Updated as students submit work.
        </p>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link
            href="/dashboard"
            className="link-anim text-[14px] tracking-[0.005em] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
