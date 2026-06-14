import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CompanyOnboardingForm } from "@/components/CompanyOnboardingForm";

export const dynamic = "force-dynamic";

export default async function CompanyOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/company");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.account_type !== "company") {
    redirect("/onboarding/select-type");
  }
  if (profile.company_id) redirect("/companies/dashboard");

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32 min-h-dvh">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Company setup
        </p>
        <h1
          className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "clamp(2rem, 3vw + 1rem, 2.75rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Tell us about your company.
        </h1>
        <p className="mt-5 text-[15px] sm:text-[16px] leading-[1.6] text-muted max-w-[58ch]">
          You&rsquo;ll be able to update everything later. Only the
          company name is required to get going.
        </p>

        <div className="mt-12">
          <CompanyOnboardingForm />
        </div>

        <div className="mt-16 pt-8 border-t border-ink/10">
          <Link
            href="/onboarding/select-type"
            className="link-anim text-[13px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back
          </Link>
        </div>
      </article>
    </main>
  );
}
