"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { timeAgo } from "@/lib/format";

type Filter = "all" | "real" | "demo";

export type AdminTaskRow = {
  id: string;
  title: string;
  companyName: string;
  isDemo: boolean;
  budgetExhausted: boolean;
  stats: {
    total: number;
    pending: number;
    released: number;
    seedCount: number;
    realCount: number;
    lastSubmittedAt: string | null;
  };
};

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "real", label: "Real companies only" },
  { key: "demo", label: "Demo / practice only" },
];

export function AdminTaskList({ rows }: { rows: AdminTaskRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "real") return rows.filter((r) => !r.isDemo);
    return rows.filter((r) => r.isDemo);
  }, [rows, filter]);

  const totalPending = visible.reduce((s, r) => s + r.stats.pending, 0);
  const realTaskCount = rows.filter((r) => !r.isDemo).length;
  const demoTaskCount = rows.filter((r) => r.isDemo).length;

  return (
    <>
      <header>
        <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
          Submissions
        </p>
        <h1
          className="mt-3 font-display font-light tracking-[-0.022em] leading-[1.04] text-ink"
          style={{
            fontSize: "clamp(1.75rem, 2.6vw + 1rem, 2.4rem)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Tasks with submissions
        </h1>
        <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[68ch]">
          {realTaskCount} real · {demoTaskCount} demo. Click a task to see
          ranked submissions with full feedback, and release them individually
          to the company.
        </p>
      </header>

      <nav aria-label="Filter" className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={f.key === filter}
            className={`
              inline-flex items-center min-h-[32px] px-3
              border text-[12px] tracking-[-0.005em]
              transition-colors duration-150 ease-out
              ${f.key === filter
                ? "bg-oxblood text-cream border-oxblood"
                : "bg-cream text-oxblood border-oxblood/50 hover:border-oxblood"
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </nav>

      <p className="mt-3 text-[12px] text-muted">
        Showing {visible.length} {visible.length === 1 ? "task" : "tasks"} ·{" "}
        {totalPending} pending release in view
      </p>

      {visible.length === 0 ? (
        <p className="mt-10 text-[14px] text-muted italic">
          No tasks match this filter.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {visible.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/submissions/task/${r.id}`}
                className="
                  py-5 grid grid-cols-[1fr_auto_auto] gap-x-6 items-center
                  -mx-3 px-3 group
                  hover:bg-parchment/60 transition-colors duration-200 ease-out
                "
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                      {r.title}
                    </p>
                    {r.isDemo && (
                      <span className="inline-flex items-center px-2 min-h-[18px] bg-ink/10 text-ink/60 text-[10px] tracking-[0.04em] uppercase">
                        Demo
                      </span>
                    )}
                    {r.stats.pending > 0 && (
                      <span className="inline-flex items-center px-2 min-h-[18px] bg-oxblood text-cream text-[10px] tracking-[0.04em] uppercase">
                        {r.stats.pending} pending
                      </span>
                    )}
                    {r.budgetExhausted && (
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-oxblood">
                        <AlertTriangle size={11} strokeWidth={1.8} />
                        Budget exhausted
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-muted truncate">
                    {r.companyName}
                    <span aria-hidden className="mx-2 text-muted/50">·</span>
                    {r.stats.total} total
                    {r.stats.seedCount > 0 && (
                      <>
                        {" "}
                        ({r.stats.realCount} real,{" "}
                        <span className="text-ink/40">
                          {r.stats.seedCount} seed
                        </span>
                        )
                      </>
                    )}
                    <span aria-hidden className="mx-2 text-muted/50">·</span>
                    {r.stats.released} released
                    {r.stats.lastSubmittedAt && (
                      <>
                        <span aria-hidden className="mx-2 text-muted/50">·</span>
                        Latest {timeAgo(r.stats.lastSubmittedAt)}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-[12px] text-muted tabular-nums shrink-0">
                  {r.stats.released}/{r.stats.total}
                </span>
                <span
                  aria-hidden
                  className="text-oxblood opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out shrink-0"
                >
                  <ArrowRight size={16} strokeWidth={1.8} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
