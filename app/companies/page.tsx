import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RuneShips for companies — skill, not resumes",
  description:
    "Post real tasks. Get ranked student work back. Hire from the top of the curve.",
};

/**
 * Public marketing surface for the company side. Logged-in company
 * users get bounced into their dashboard. Logged-in student users
 * see the page render normally (they might be sharing the link).
 */
export default async function CompaniesMarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, company_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.account_type === "company") {
      redirect(profile.company_id ? "/companies/dashboard" : "/onboarding/company");
    }
  }

  return (
    <main>
      {/* HERO */}
      <section className="bg-cream">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            For companies
          </p>
          <h1
            className="mt-5 font-display font-light tracking-[-0.022em] leading-[0.98] text-ink max-w-[16ch]"
            style={{
              fontSize: "var(--text-display)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Skill, not résumés.
          </h1>
          <p className="mt-8 text-[19px] sm:text-[22px] leading-[1.45] text-ink/80 max-w-[44ch]">
            Post real tasks. Get ranked student work back. Hire from the top
            of the curve.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-7">
            <Link
              href="/login?next=/onboarding/select-type"
              className="
                inline-flex items-center
                min-h-[56px] px-7
                bg-oxblood text-cream border border-oxblood
                text-[15px] tracking-[0.01em] font-medium
                transition-colors duration-200 ease-out
                hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
              "
            >
              Start posting <span aria-hidden className="ml-1.5">→</span>
            </Link>
            <Link
              href="#how"
              className="link-anim text-[14px] tracking-[0.01em] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="bg-parchment border-t border-oxblood/40 scroll-mt-28"
      >
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <h2
            className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center max-w-[16ch] mx-auto"
            style={{ fontSize: "var(--text-section)" }}
          >
            How RuneShips works.
          </h2>

          <ol className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
            <Step
              n="1"
              title="Post a task."
              body="Upload anything — a brief, a dataset, a code repo, a video reference. Set what you want students to deliver and how it should be evaluated."
            />
            <Step
              n="2"
              title="Students submit."
              body="Your task goes live to the cohort. Each submission gets scored across five dimensions by Anthropic's Claude — or by your own team if you'd rather review yourself."
            />
            <Step
              n="3"
              title="You see ranked work."
              body="Submissions arrive ranked by overall score, with per-dimension breakdowns. Sort by strategy, communication, technical, or whichever skill matters most to you for this hire."
            />
          </ol>
        </div>
      </section>

      {/* WHY IT'S DIFFERENT */}
      <section className="bg-cream border-t border-oxblood/40">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-20 sm:pt-28 pb-24 sm:pb-32">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-5">
              <h2
                className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink max-w-[14ch]"
                style={{ fontSize: "var(--text-section)" }}
              >
                Filter on work, not credentials.
              </h2>
            </div>
            <div className="col-span-12 md:col-span-6 md:col-start-7 prose-editorial text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 space-y-5">
              <p>
                Résumés filter on the wrong thing. School name, internship
                pedigree, polish — none of which tell you whether the candidate
                can actually do the work.
              </p>
              <p>
                RuneShips flips it. You post the actual work. The student
                actually does it. You see what they produced, alongside an
                AI-generated rubric score across the five dimensions that
                matter for any knowledge-work hire — strategy, execution,
                communication, technical, creativity.
              </p>
              <p>
                The students who rise to the top of your task probably can do
                the job. That&rsquo;s a stronger signal than any line on a
                résumé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-ink text-cream border-t border-oxblood">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 pt-24 sm:pt-32 pb-24 sm:pb-32 text-center">
          <h2
            className="font-display font-light tracking-[-0.022em] leading-[0.98] text-cream max-w-[14ch] mx-auto"
            style={{
              fontSize: "var(--text-closing)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Post your first task.
          </h2>
          <div className="mt-10 flex justify-center">
            <Link
              href="/login?next=/onboarding/select-type"
              className="
                inline-flex items-center
                min-h-[56px] px-7
                bg-oxblood text-cream border border-oxblood
                text-[15px] tracking-[0.01em] font-medium
                transition-colors duration-200 ease-out
                hover:bg-oxblood-hover
              "
            >
              Get started <span aria-hidden className="ml-1.5">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="list-none">
      <p className="font-display text-[20px] leading-[1] text-oxblood tabular-nums tracking-[-0.012em]">
        {n}.
      </p>
      <p
        className="mt-4 font-display font-light tracking-[-0.014em] leading-[1.15] text-ink"
        style={{ fontSize: "clamp(1.4rem, 1vw + 1rem, 1.6rem)" }}
      >
        {title}
      </p>
      <p className="mt-4 text-[15px] leading-[1.65] text-ink/80">{body}</p>
    </li>
  );
}
