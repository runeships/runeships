import Link from "next/link";
import { requireCompanyUser } from "@/lib/account";
import { createAdminClient } from "@/lib/supabase-admin";
import { timeAgo } from "@/lib/format";
import { PenTool, Presentation, Code, Table, Target, Palette } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>> = {
  writing: PenTool,
  deck: Presentation,
  code: Code,
  spreadsheet: Table,
  strategy: Target,
  design: Palette,
};

export default async function CompanyDashboardPage() {
  const { company } = await requireCompanyUser();
  const admin = createAdminClient();

  const [tasksRes, submissionsRes] = await Promise.all([
    admin
      .from("tasks")
      .select(
        "id, slug, title, category, submission_mode, evaluation_mode, created_at, is_published",
      )
      .eq("company_id", company.id)
      .eq("is_demo", false)
      .order("created_at", { ascending: false }),
    admin.from("submissions").select("id, task_id"),
  ]);

  const tasks = tasksRes.data ?? [];
  const taskIdSet = new Set(tasks.map((t) => t.id));
  const submissionCountByTask = new Map<string, number>();
  for (const s of submissionsRes.data ?? []) {
    if (taskIdSet.has(s.task_id)) {
      submissionCountByTask.set(
        s.task_id,
        (submissionCountByTask.get(s.task_id) ?? 0) + 1,
      );
    }
  }
  const totalSubmissions = Array.from(submissionCountByTask.values()).reduce(
    (sum, n) => sum + n,
    0,
  );

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-32 md:pt-36 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1080px]">
        <header>
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Dashboard
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4.4vw + 1rem, 3.75rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            {company.name}
          </h1>
          <p className="mt-5 text-[15px] sm:text-[16px] leading-[1.55] text-muted">
            {tasks.length} {tasks.length === 1 ? "task posted" : "tasks posted"}
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            {totalSubmissions} {totalSubmissions === 1 ? "submission received" : "submissions received"}
          </p>

          <div className="mt-9">
            <Link
              href="/companies/tasks/new"
              className="
                inline-flex items-center
                min-h-[56px] px-7
                bg-oxblood text-cream border border-oxblood
                text-[15px] tracking-[0.01em] font-medium
                transition-colors duration-200 ease-out
                hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
              "
            >
              Post a new task <span aria-hidden className="ml-1.5">→</span>
            </Link>
          </div>
        </header>

        <section className="mt-20 sm:mt-24">
          <div>
            <h2
              className="font-display font-light tracking-[-0.018em] leading-[1.04] text-ink"
              style={{ fontSize: "clamp(1.75rem, 1.4vw + 1rem, 2rem)" }}
            >
              Your tasks
            </h2>
            <hr className="mt-5 border-0 border-t border-ink/10" />
          </div>

          {tasks.length === 0 ? (
            <div className="mt-14 pl-6 sm:pl-8 border-l-2 border-oxblood/60 max-w-[60ch]">
              <p className="text-[15px] leading-[1.6] text-ink/85">
                Post your first task to see student submissions come in.
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-muted">
                The whole flow takes a few minutes. Upload a brief or
                dataset, write a few lines about what you want, and
                students start working immediately.
              </p>
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {tasks.map((t) => {
                const Icon = CATEGORY_ICONS[t.category] ?? Target;
                const subCount = submissionCountByTask.get(t.id) ?? 0;
                return (
                  <li key={t.id}>
                    <Link
                      href={`/companies/tasks/${t.id}`}
                      className="
                        group grid grid-cols-[auto_1fr_auto] gap-5 items-center
                        py-5 -mx-3 px-3
                        transition-colors duration-200 ease-out
                        hover:bg-parchment/60
                      "
                    >
                      <span className="text-oxblood">
                        <Icon aria-hidden size={18} strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-normal text-[18px] sm:text-[19px] leading-[1.25] tracking-[-0.01em] text-ink group-hover:text-oxblood transition-colors duration-200 ease-out">
                          {t.title}
                        </p>
                        <p className="mt-1 text-[12px] tracking-[0.04em] uppercase text-muted">
                          Posted {timeAgo(t.created_at)}
                          <span aria-hidden className="mx-2 text-muted/50">·</span>
                          {subCount}{" "}
                          {subCount === 1 ? "submission" : "submissions"}
                          <span aria-hidden className="mx-2 text-muted/50">·</span>
                          {t.category}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] tracking-[0.16em] uppercase text-oxblood">
                        {subCount === 0
                          ? "Awaiting submissions"
                          : `${subCount} ${subCount === 1 ? "submission" : "submissions"}`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
