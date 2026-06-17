import Link from "next/link";
import { requireCompanyUser } from "@/lib/account";
import { CreateTaskForm } from "@/components/CreateTaskForm";

export const dynamic = "force-dynamic";
// createTask runs a bias check via Anthropic (~3-5s) plus the DB
// work — Vercel's default 10s server-action ceiling was tripping
// the redirect even though the task insert succeeded. Server
// actions inherit maxDuration from the calling route.
export const maxDuration = 30;

export default async function NewTaskPage() {
  const { company } = await requireCompanyUser();

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[820px]">
        <nav
          aria-label="Breadcrumb"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <Link
            href="/companies/dashboard"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Dashboard
          </Link>
        </nav>

        <p className="mt-7 text-[11px] tracking-[0.20em] uppercase text-oxblood">
          New task
        </p>
        <h1
          className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
          style={{
            fontSize: "clamp(2rem, 3vw + 1rem, 2.5rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Post a new task
        </h1>
        <p className="mt-5 text-[15px] sm:text-[16px] leading-[1.6] text-muted max-w-[58ch]">
          Upload whatever&rsquo;s relevant. Add as much or as little context
          as you want. Students see exactly what you provide.
        </p>

        <div className="mt-12">
          <CreateTaskForm companyId={company.id} />
        </div>
      </div>
    </main>
  );
}
