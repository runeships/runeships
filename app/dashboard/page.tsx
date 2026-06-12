import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Reveal } from "@/components/Reveal";
import { RadarChart, type RadarValues } from "@/components/RadarChart";

export const dynamic = "force-dynamic";

/**
 * Post-onboarding home for signed-in students. Server-renders the
 * profile + self-rated radar so the dashboard reflects the live row
 * in `public.profiles`. Real task list arrives in Phase 2B; for now
 * this proves the auth → onboarding → profile-read loop end to end.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, school, graduation_year, career_tracks, onboarding_completed, self_rated_strategy, self_rated_execution, self_rated_communication, self_rated_technical, self_rated_creativity",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login?error=invalid_link");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] ?? "there";

  const radarValues: RadarValues = {
    strategy: profile.self_rated_strategy,
    execution: profile.self_rated_execution,
    communication: profile.self_rated_communication,
    technical: profile.self_rated_technical,
    creativity: profile.self_rated_creativity,
  };

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-40 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <Reveal mode="load" delay={0.05}>
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Dashboard
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4.4vw + 1rem, 3.75rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Welcome, {firstName}.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.55] text-muted max-w-[58ch]">
            Your tasks will live here. Real tasks from real companies, plus
            practice briefs to warm up.
          </p>
        </Reveal>

        <Reveal mode="load" delay={0.20} className="mt-12 sm:mt-14">
          <div className="border-t border-oxblood/40 pt-10 sm:pt-12 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-12 items-start">
            {/* LEFT — task-list placeholder */}
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
                Coming next
              </p>
              <h2
                className="mt-4 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink"
                style={{ fontSize: "clamp(1.65rem, 1.6vw + 1rem, 2rem)" }}
              >
                Task list coming next.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.6] text-ink/80 max-w-[56ch]">
                We&rsquo;re seeding the first batch right now — four practice
                briefs to warm up on, plus the first three real company tasks
                from Godly, myOrbit, and Veganuño. Each one scores across the
                same five dimensions you just rated yourself on.
              </p>
              <p className="mt-5 text-[14px] leading-[1.6] text-muted max-w-[56ch]">
                Hold tight. You&rsquo;ll see them appear here when the next
                deploy lands.
              </p>
            </div>

            {/* RIGHT — your current profile */}
            <div>
              <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
                Your profile · self-rated
              </p>
              <div className="mt-4 border border-ink/15 bg-cream p-6 sm:p-7 flex items-center justify-center">
                <RadarChart values={radarValues} size={380} />
              </div>
              <ul className="mt-6 text-[13px] tracking-[0.005em] text-muted space-y-1.5">
                {profile.school && (
                  <li>
                    <span className="text-ink">{profile.school}</span>
                    {profile.graduation_year ? ` · ${profile.graduation_year}` : ""}
                  </li>
                )}
                {profile.career_tracks && profile.career_tracks.length > 0 && (
                  <li>
                    <span className="text-ink">{profile.career_tracks.join(" · ")}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
