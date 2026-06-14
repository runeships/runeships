"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Dim = "strategy" | "execution" | "communication" | "technical" | "creativity";
type SortKey = "overall" | Dim;

type RankedRow = {
  submissionId: string;
  submissionTitle: string;
  supportingLink: string | null;
  createdAt: string;
  studentName: string;
  school: string | null;
  gradYear: number | null;
  hasFeedback: true;
  scores: {
    strategy: number;
    execution: number;
    communication: number;
    technical: number;
    creativity: number;
    total: number;
  };
};


const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
];

export function CompanySubmissionsTable({
  rows,
  pending,
}: {
  rows: RankedRow[];
  pending: Array<{
    submissionId: string;
    studentName: string;
    createdAt: string;
  }>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("overall");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = sortKey === "overall" ? a.scores.total : a.scores[sortKey];
      const bv = sortKey === "overall" ? b.scores.total : b.scores[sortKey];
      return bv - av;
    });
    return copy.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, sortKey]);

  return (
    <>
      <nav
        aria-label="Sort options"
        className="mt-8 flex flex-wrap gap-2"
      >
        {SORT_OPTIONS.map((opt) => {
          const active = opt.key === sortKey;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortKey(opt.key)}
              aria-pressed={active}
              className={`
                inline-flex items-center min-h-[36px] px-4
                border text-[13px] tracking-[-0.005em]
                transition-colors duration-150 ease-out
                ${active
                  ? "bg-oxblood text-cream border-oxblood"
                  : "bg-cream text-oxblood border-oxblood/50 hover:border-oxblood"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </nav>

      {sorted.length > 0 && (
        <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {sorted.map((r) => (
            <li
              key={r.submissionId}
              className="py-5 grid grid-cols-[40px_44px_1fr_auto_auto] gap-x-5 items-center"
            >
              <span className="text-right text-[13px] tabular-nums text-muted">
                {r.rank}
              </span>
              <span
                aria-hidden
                className="
                  w-9 h-9 rounded-full
                  inline-flex items-center justify-center
                  border border-oxblood bg-parchment
                  font-display text-[12px] tracking-[0.04em] text-oxblood
                "
              >
                {initialsFor(r.studentName)}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                  {r.studentName}
                </p>
                <p className="mt-0.5 text-[13px] text-muted truncate">
                  {r.school ?? "(no school listed)"}
                  {r.gradYear && (
                    <>
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      Class of {r.gradYear}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="font-display text-[20px] leading-[1] text-oxblood tabular-nums"
                  style={{ fontVariationSettings: '"opsz" 96' }}
                >
                  {sortKey === "overall"
                    ? Math.round(r.scores.total)
                    : r.scores[sortKey]}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
                  {sortKey === "overall" ? "total" : sortKey}
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href={`/companies/submissions/${r.submissionId}`}
                  className="link-anim text-[13px] tracking-[0.005em] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
                >
                  View <span aria-hidden>→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pending.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
            Pending feedback
          </p>
          <ul className="divide-y divide-ink/10 border-y border-ink/10">
            {pending.map((p) => (
              <li
                key={p.submissionId}
                className="py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-[14px] text-ink truncate">
                    Submission from {p.studentName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    Feedback generating
                  </p>
                </div>
                <Link
                  href={`/companies/submissions/${p.submissionId}`}
                  className="link-anim text-[12px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out shrink-0"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-[12px] leading-[1.55] text-muted">
        {sorted.length} ranked {sorted.length === 1 ? "submission" : "submissions"}
        {pending.length > 0 && ` · ${pending.length} pending`}
      </p>
    </>
  );
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "•";
}
