import Link from "next/link";
import { requireCompanyUser } from "@/lib/account";
import {
  CompanyProfileForm,
  type CompanyProfileInitial,
} from "@/components/CompanyProfileForm";

export const dynamic = "force-dynamic";

export default async function CompanyProfilePage() {
  const { user, company } = await requireCompanyUser();
  const email = user.email ?? "(no email on file)";

  const initialValues: CompanyProfileInitial = {
    name: company.name ?? "",
    industry: company.industry ?? "",
    sizeBand: company.size_band ?? "",
    website: stripProtocol(company.website ?? ""),
    description: company.description ?? "",
    taskCategories: company.task_categories ?? [],
  };

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[820px]">
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
          Company profile
        </h1>
        <p className="mt-5 text-[14px] leading-[1.55] text-muted">
          {email}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Signed in as the {company.name} account
        </p>

        <div className="mt-12 sm:mt-14">
          <CompanyProfileForm initialValues={initialValues} />
        </div>

        <div className="mt-20 pt-8 border-t border-ink/10">
          <Link
            href="/companies/dashboard"
            className="link-anim text-[14px] tracking-[0.005em] text-ink hover:text-oxblood transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

// Inputs display the host without the scheme; updateCompany re-adds
// https:// on save. Keeps the field tidy across edits.
function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}
