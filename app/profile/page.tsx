import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  ProfileTabForm,
  type ProfileInitial,
} from "@/components/ProfileTabForm";
import { AccountTab } from "@/components/AccountTab";
import { PrivacyTab } from "@/components/PrivacyTab";
import { EarnedStanding } from "@/components/EarnedStanding";
import { getRankings } from "@/lib/rankings";

export const dynamic = "force-dynamic";

type Tab = "profile" | "account" | "privacy";
const VALID_TABS: ReadonlyArray<Tab> = ["profile", "account", "privacy"];

function parseTab(raw: string | string[] | undefined): Tab {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (VALID_TABS as readonly string[]).includes(value ?? "")
    ? (value as Tab)
    : "profile";
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, school, graduation_year, career_tracks, specific_skills, self_rated_strategy, self_rated_execution, self_rated_communication, self_rated_technical, self_rated_creativity, notify_on_feedback, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Profile row should exist via the on_auth_user_created trigger.
    // If it doesn't, push the user back to onboarding which creates it.
    redirect("/onboarding");
  }

  const tab = parseTab((await searchParams).tab);
  const email = user.email ?? "(no email on file)";
  const signupDate = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  const initialValues: ProfileInitial = {
    fullName: profile.full_name ?? "",
    school: profile.school ?? "",
    graduationYear: profile.graduation_year,
    careerTracks: profile.career_tracks ?? [],
    specificSkills: profile.specific_skills ?? [],
    selfRated: {
      strategy: profile.self_rated_strategy,
      execution: profile.self_rated_execution,
      communication: profile.self_rated_communication,
      technical: profile.self_rated_technical,
      creativity: profile.self_rated_creativity,
    },
  };

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        {/* Heading */}
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Account
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2rem, 3.6vw + 1rem, 3.25rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Your account
        </h1>
        <p className="mt-5 text-[14px] leading-[1.55] text-muted">
          {email}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Joined {signupDate}
        </p>

        {/* Tab nav */}
        <nav
          aria-label="Account sections"
          className="mt-12 sm:mt-14 border-b border-ink/15"
        >
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            <TabLink active={tab === "profile"} href="/profile?tab=profile" label="Profile" />
            <TabLink active={tab === "account"} href="/profile?tab=account" label="Account" />
            <TabLink active={tab === "privacy"} href="/profile?tab=privacy" label="Privacy & Legal" />
          </ul>
        </nav>

        {/* Tab content */}
        <div className="mt-12 sm:mt-16">
          {tab === "profile" && (
            <>
              <ProfileTabForm initialValues={initialValues} />
              {/* Read-only earned standing — fetched server-side so we
                  don't ship rankings logic to the client form. */}
              <EarnedStanding rankings={await getRankings(user.id)} />
            </>
          )}
          {tab === "account" && (
            <AccountTab
              email={email}
              notifyOnFeedback={profile.notify_on_feedback}
            />
          )}
          {tab === "privacy" && <PrivacyTab />}
        </div>

        {/* Footer back-link */}
        <div className="mt-20 sm:mt-24 pt-8 border-t border-ink/10">
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

function TabLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "page" : undefined}
        className={`
          inline-block py-3 -mb-px border-b-2
          text-[14px] tracking-[0.005em]
          transition-colors duration-200 ease-out
          focus-visible:outline-none
          ${active
            ? "text-ink font-medium border-oxblood"
            : "text-muted border-transparent hover:text-ink"
          }
        `}
      >
        {label}
      </Link>
    </li>
  );
}
