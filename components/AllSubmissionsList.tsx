"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type SortKey = "newest" | "score_desc" | "title";

export type SubmissionRow = {
  id: string;
  submissionTitle: string;
  createdAt: string;
  taskTitle: string | null;
  companyName: string | null;
  totalScore: number | null;
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "score_desc", label: "Highest score" },
  { key: "title", label: "Title" },
];

export function AllSubmissionsList({ rows }: { rows: SubmissionRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sortKey === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortKey === "score_desc") {
        const av = a.totalScore ?? -1;
        const bv = b.totalScore ?? -1;
        return bv - av;
      }
      return a.submissionTitle.localeCompare(b.submissionTitle);
    });
    return copy;
  }, [rows, sortKey]);

  return (
    <>
      <nav
        aria-label="Sort submissions"
        className="flex flex-wrap gap-2"
      >
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortKey(opt.key)}
            aria-pressed={opt.key === sortKey}
            className={`
              inline-flex items-center min-h-[36px] px-4
              border text-[13px] tracking-[-0.005em]
              transition-colors duration-150 ease-out
              ${opt.key === sortKey
                ? "bg-oxblood text-cream border-oxblood"
                : "bg-cream text-oxblood border-oxblood/50 hover:border-oxblood"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      <ul className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {sorted.map((s) => (
          <li key={s.id}>
            <Link
              href={`/submissions/${s.id}`}
              className="
                group grid grid-cols-[1fr_auto] gap-5 items-start
                py-5 sm:py-6 px-3
                transition-colors duration-200 ease-out
                hover:bg-parchment
              "
            >
              <div className="min-w-0">
                <h3 className="font-display font-normal text-[16px] sm:text-[18px] leading-[1.25] tracking-[-0.01em] text-ink">
                  {s.submissionTitle}
                </h3>
                {s.taskTitle && (
                  <p className="mt-1.5 text-[13px] leading-[1.5] text-muted">
                    for {s.taskTitle}
                    {s.companyName && (
                      <>
                        <span aria-hidden className="mx-2 text-muted/50">·</span>
                        {s.companyName}
                      </>
                    )}
                  </p>
                )}
                <p className="mt-1 text-[11px] tracking-[0.04em] text-muted/80">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="text-right shrink-0">
                {s.totalScore !== null ? (
                  <>
                    <p
                      className="font-display text-[22px] sm:text-[24px] leading-[1] tracking-[-0.01em] text-oxblood tabular-nums"
                      style={{ fontVariationSettings: '"opsz" 96' }}
                    >
                      {Math.round(s.totalScore)}
                    </p>
                    <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
                      total
                    </p>
                  </>
                ) : (
                  <span className="text-[11px] tracking-[0.04em] uppercase text-muted">
                    Awaiting score
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[12px] text-muted">
        {sorted.length} submission{sorted.length === 1 ? "" : "s"}
      </p>
    </>
  );
}
