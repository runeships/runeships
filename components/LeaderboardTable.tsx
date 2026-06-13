"use client";

import { useMemo, useState } from "react";
import { type LeaderboardRow } from "@/lib/rankings";

type SortKey =
  | "overall"
  | "strategy"
  | "execution"
  | "communication"
  | "technical"
  | "creativity"
  | "activity";

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
  { key: "activity", label: "Most active" },
];

/**
 * Client-side sorter for the leaderboard table. Receives the full
 * ranked list from the server component and re-sorts in memory on
 * filter chip click — no refetch.
 *
 * Stat column + percentile follow the selected sort key. Rows with
 * no submissions sink to the bottom (their stat value is null) and
 * show "No submissions yet" instead of a percentile.
 */
export function LeaderboardTable({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("overall");

  const sorted = useMemo(() => {
    const withStat = rows.map((r) => ({
      row: r,
      stat: statFor(r, sortKey),
    }));
    // Stats=null sink to the bottom regardless of sort key.
    withStat.sort((a, b) => {
      if (a.stat === null && b.stat === null) return 0;
      if (a.stat === null) return 1;
      if (b.stat === null) return -1;
      return b.stat - a.stat;
    });
    // Cohort size for percentile calc = users with stat data.
    const ranked = withStat.length;
    return withStat.map((entry, i) => ({
      ...entry,
      rank: i + 1,
      // Top percentile: i=0 → "Top 0%" (best). i=N-1 → "Top X%".
      topPct: entry.stat === null ? null : Math.round((i / ranked) * 100),
    }));
  }, [rows, sortKey]);

  return (
    <>
      {/* Filter chips — no top margin so the parent can control
          spacing whether this is embedded in a panel or rendered as
          its own page. */}
      <nav
        aria-label="Sort options"
        className="mt-6 flex flex-wrap gap-2"
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
                inline-flex items-center
                min-h-[36px] px-4
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

      {/* Table */}
      <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        {sorted.map(({ row, stat, rank, topPct }) => {
          const isMe = row.userId === currentUserId;
          return (
            <li
              key={row.userId}
              className={`
                grid grid-cols-[40px_44px_1fr_auto_auto] gap-x-5 items-center
                py-5
                transition-colors duration-200 ease-out
                ${isMe
                  ? "bg-parchment/60 border-l-2 border-oxblood pl-3 -ml-3"
                  : "hover:bg-parchment/40"
                }
              `}
            >
              {/* Rank */}
              <span className="text-right text-[13px] tabular-nums text-muted">
                {rank}
              </span>

              {/* Avatar */}
              <span
                aria-hidden
                className="
                  w-9 h-9 rounded-full
                  inline-flex items-center justify-center
                  border border-oxblood bg-parchment
                  font-display text-[12px] tracking-[0.04em] text-oxblood
                "
              >
                {initialsFor(row.fullName)}
              </span>

              {/* Name + school */}
              <div className="min-w-0">
                <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                  {row.fullName}
                  {isMe && (
                    <span className="ml-2 text-[11px] tracking-[0.16em] uppercase text-oxblood">
                      You
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] text-muted truncate">
                  {row.school ?? "(no school listed)"}
                  {row.graduationYear && (
                    <>
                      <span aria-hidden className="mx-2 text-muted/50">·</span>
                      Class of {row.graduationYear}
                    </>
                  )}
                </p>
              </div>

              {/* Stat */}
              <div className="text-right shrink-0">
                {stat === null ? (
                  <span className="text-[12px] text-muted">No submissions yet</span>
                ) : (
                  <p
                    className="font-display text-[18px] leading-[1] text-oxblood tabular-nums"
                    style={{ fontVariationSettings: '"opsz" 96' }}
                  >
                    {sortKey === "activity"
                      ? `${stat}`
                      : Math.round(stat)}
                  </p>
                )}
                {stat !== null && (
                  <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
                    {sortKey === "activity"
                      ? stat === 1
                        ? "submission"
                        : "submissions"
                      : sortKey === "overall"
                      ? "total"
                      : "score"}
                  </p>
                )}
              </div>

              {/* Top percentile */}
              <div className="text-right shrink-0 w-[80px]">
                {topPct === null ? (
                  <span aria-hidden className="text-muted">—</span>
                ) : (
                  <span className="text-[11px] tracking-[0.16em] uppercase text-oxblood">
                    Top {topPct}%
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function statFor(row: LeaderboardRow, sortKey: SortKey): number | null {
  if (sortKey === "activity") return row.submissionCount;
  if (sortKey === "overall") return row.overall;
  return row.aggregates[sortKey];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "•";
}
