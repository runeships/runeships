import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { setAccountType } from "@/app/actions/setAccountType";

export const dynamic = "force-dynamic";

/**
 * First-time signup type selector. Two big editorial cards: student
 * vs company. Submit on click is a server action that creates the
 * profile row + sets account_type, then redirects to the right next
 * step.
 */
export default async function SelectTypePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/select-type");

  // If they already chose a type, bounce them through.
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, onboarding_completed, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.account_type === "company") {
    redirect(profile.company_id ? "/companies/dashboard" : "/onboarding/company");
  }
  if (profile?.account_type === "student") {
    redirect(profile.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[920px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Welcome
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Welcome to RuneShips.
        </h1>
        <p className="mt-6 text-[17px] sm:text-[19px] leading-[1.5] text-muted font-display italic max-w-[58ch]">
          Are you joining as a student or as a company?
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          <TypeCard
            kicker="Student"
            title="I’m a student."
            body="Practice on real tasks, build a portable skill ranking, get discovered by companies."
            value="student"
          />
          <TypeCard
            kicker="Company"
            title="We’re a company."
            body="Post real tasks, receive ranked student submissions, hire from the top of the cohort."
            value="company"
          />
        </div>
      </div>
    </main>
  );
}

function TypeCard({
  kicker,
  title,
  body,
  value,
}: {
  kicker: string;
  title: string;
  body: string;
  value: "student" | "company";
}) {
  return (
    <form action={setAccountType}>
      <input type="hidden" name="type" value={value} />
      <button
        type="submit"
        className="
          group w-full text-left
          border border-ink/15 bg-cream
          p-8 sm:p-10
          transition-colors duration-200 ease-out
          hover:border-oxblood hover:bg-parchment/40
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
          rounded-[2px]
        "
      >
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          {kicker}
        </p>
        <p
          className="mt-4 font-display font-light leading-[1.1] tracking-[-0.018em] text-ink"
          style={{ fontSize: "clamp(1.6rem, 1.4vw + 1rem, 2rem)" }}
        >
          {title}
        </p>
        <p className="mt-4 text-[15px] leading-[1.6] text-ink/80">{body}</p>
        <p className="mt-7 text-[13px] tracking-[0.005em] text-oxblood">
          Continue <span aria-hidden className="ml-1 group-hover:ml-2 transition-all">→</span>
        </p>
      </button>
    </form>
  );
}
