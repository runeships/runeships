"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  type LeaderboardRow,
  type LeaderboardTaskOption,
  type Dimension,
} from "@/lib/rankings";

type SortKey =
  | "overall"
  | "avg"
  | "strategy"
  | "execution"
  | "communication"
  | "technical"
  | "creativity"
  | "activity";

// Three editorial groups. Aggregate metrics (avg, overall) are the
// primary cluster — avg-per-task is now the headline metric used by
// the dashboard hero. Dimension metrics in the middle. Volume on the
// far right. Rendered with hairline separators between groups.
const SORT_GROUPS: Array<Array<{ key: SortKey; label: string }>> = [
  [
    { key: "avg", label: "Avg per task" },
    { key: "overall", label: "Overall" },
  ],
  [
    { key: "strategy", label: "Strategy" },
    { key: "execution", label: "Execution" },
    { key: "communication", label: "Communication" },
    { key: "technical", label: "Technical" },
    { key: "creativity", label: "Creativity" },
  ],
  [{ key: "activity", label: "Most active" }],
];

const DEFAULT_SORT: SortKey = "avg";

const VALID_SORT_KEYS = new Set<SortKey>([
  "overall",
  "avg",
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
  "activity",
]);

const GRAD_YEAR_OPTIONS = [2025, 2026, 2027, 2028, 2029, 2030] as const;
const DIM_KEYS = new Set<SortKey>([
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
]);

/**
 * Embedded cohort leaderboard.
 *
 * Two scope filters (task + grad year) and eight sort keys. State
 * lives in the URL — useSearchParams seeds the initial values and
 * window.history.replaceState syncs changes without triggering a
 * full Next re-render (the dashboard server component doesn't read
 * these params).
 *
 * When a task is selected, the stat column and dimension sorts read
 * from each user's best scores ON that task rather than their
 * global aggregates. Users without a submission on the active task
 * drop out of the table; if the caller is one of them, an inline
 * "you haven't submitted" notice with a deep link to the task page
 * appears above the table.
 */
export function LeaderboardTable({
  rows,
  tasks,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  tasks: LeaderboardTaskOption[];
  currentUserId: string;
}) {
  const sp = useSearchParams();

  // ─── Seed local state from URL on mount ─────────────────────
  const [sortKey, setSortKeyState] = useState<SortKey>(() => {
    const v = sp?.get("sort");
    return v && VALID_SORT_KEYS.has(v as SortKey) ? (v as SortKey) : DEFAULT_SORT;
  });
  const [taskSlug, setTaskSlugState] = useState<string>(() => {
    const v = sp?.get("task");
    return v && tasks.some((t) => t.slug === v) ? v : "all";
  });
  const [yearStr, setYearStrState] = useState<string>(() => {
    const v = sp?.get("year");
    return v && GRAD_YEAR_OPTIONS.map(String).includes(v) ? v : "all";
  });

  // ─── URL sync helper (no Next router roundtrip) ─────────────
  const updateUrl = useCallback(
    (key: string, value: string, defaultValue: string) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (value === defaultValue) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const qs = params.toString();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", newUrl);
    },
    [],
  );

  const setSortKey = useCallback(
    (k: SortKey) => {
      setSortKeyState(k);
      updateUrl("sort", k, DEFAULT_SORT);
    },
    [updateUrl],
  );
  const setTaskSlug = useCallback(
    (s: string) => {
      setTaskSlugState(s);
      updateUrl("task", s, "all");
    },
    [updateUrl],
  );
  const setYearStr = useCallback(
    (y: string) => {
      setYearStrState(y);
      updateUrl("year", y, "all");
    },
    [updateUrl],
  );

  const activeTask = useMemo(
    () => tasks.find((t) => t.slug === taskSlug) ?? null,
    [tasks, taskSlug],
  );

  // ─── Filter rows by scope ───────────────────────────────────
  const filtered = useMemo(() => {
    let r = rows;
    if (activeTask) {
      r = r.filter((row) => activeTask.id in row.taskScores);
    }
    if (yearStr !== "all") {
      const year = Number(yearStr);
      r = r.filter((row) => row.graduationYear === year);
    }
    return r;
  }, [rows, activeTask, yearStr]);

  // ─── Sort + rank ────────────────────────────────────────────
  const sorted = useMemo(() => {
    const withStat = filtered.map((r) => ({
      row: r,
      stat: statFor(r, sortKey, activeTask?.id ?? null),
    }));
    withStat.sort((a, b) => {
      if (a.stat === null && b.stat === null) return 0;
      if (a.stat === null) return 1;
      if (b.stat === null) return -1;
      return b.stat - a.stat;
    });
    const ranked = withStat.length;
    return withStat.map((entry, i) => ({
      ...entry,
      rank: i + 1,
      topPct: entry.stat === null ? null : Math.round((i / ranked) * 100),
    }));
  }, [filtered, sortKey, activeTask]);

  const userIndex = sorted.findIndex((r) => r.row.userId === currentUserId);
  const userOnFilteredList = userIndex !== -1;
  const showTaskNotice = activeTask && !userOnFilteredList;

  // ─── Compact view: top 3 + (gap indicator) + caller's row ────
  // Picks up the user wherever they rank. If they're already in
  // top 3 we don't render a second copy. Adjacent (rank 4) skips
  // the ellipsis. Rank 5+ shows the "N between" separator.
  const topThree = sorted.slice(0, Math.min(3, sorted.length));
  const userOutsideTop = userIndex >= 3;
  const userEntry = userOutsideTop ? sorted[userIndex] : null;
  const gapCount = userIndex > 3 ? userIndex - 3 : 0;

  // ─── Footer caption ─────────────────────────────────────────
  const footerCaption = useMemo(() => {
    const n = sorted.length;
    const studentWord = n === 1 ? "student" : "students";
    if (activeTask && yearStr !== "all") {
      return `${n} ${studentWord} in the Class of ${yearStr} with submissions on ${activeTask.title}.`;
    }
    if (activeTask) {
      return `${n} ${studentWord} with submissions on ${activeTask.title}.`;
    }
    if (yearStr !== "all") {
      return `${n} ${studentWord} in the Class of ${yearStr}.`;
    }
    return `${n} ${studentWord} in the RuneShips cohort. Updated as students submit work.`;
  }, [sorted.length, activeTask, yearStr]);

  // ─── Active-filter caption above the table ──────────────────
  const filterCaption = useMemo(() => {
    if (activeTask && yearStr !== "all") {
      return `Top performers on ${activeTask.title} — Class of ${yearStr}.`;
    }
    if (activeTask) return `Top performers on ${activeTask.title}.`;
    if (yearStr !== "all") return `Class of ${yearStr}.`;
    return null;
  }, [activeTask, yearStr]);

  return (
    <>
      {/* Scope dropdowns */}
      <div className="mt-6 flex flex-wrap items-end gap-6">
        <FilterSelect
          label="Task"
          value={taskSlug}
          onChange={setTaskSlug}
          options={[
            { value: "all", label: "All tasks" },
            ...tasks.map((t) => ({ value: t.slug, label: t.title })),
          ]}
        />
        <FilterSelect
          label="Class of"
          value={yearStr}
          onChange={setYearStr}
          options={[
            { value: "all", label: "All classes" },
            ...GRAD_YEAR_OPTIONS.map((y) => ({
              value: String(y),
              label: String(y),
            })),
          ]}
        />
      </div>

      {/* Sort chips — three groups with hairline dividers between. */}
      <nav
        aria-label="Sort options"
        className="mt-6 flex flex-wrap items-center gap-y-2"
      >
        {SORT_GROUPS.map((group, groupIdx) => (
          <div key={groupIdx} className="flex flex-wrap items-center gap-2">
            {groupIdx > 0 && (
              <span
                aria-hidden
                className="inline-block h-5 w-px bg-ink/20 mx-2"
              />
            )}
            {group.map((opt) => {
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
          </div>
        ))}
      </nav>

      {/* Filter caption */}
      {filterCaption && (
        <p className="mt-5 font-display italic text-[15px] text-muted">
          {filterCaption}
        </p>
      )}

      {/* "You haven't submitted" notice */}
      {showTaskNotice && activeTask && (
        <p className="mt-5 text-[14px] leading-[1.55] text-muted">
          You haven&rsquo;t submitted on this task yet.{" "}
          <Link
            href={`/tasks/${activeTask.companySlug}/${activeTask.slug}`}
            className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
          >
            Submit
          </Link>{" "}
          to appear on this leaderboard.
        </p>
      )}

      {/* Table — top 3 + ellipsis + caller */}
      <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
        {topThree.map((entry) =>
          renderRow(entry, sortKey, activeTask, currentUserId),
        )}
        {gapCount > 0 && <EllipsisRow count={gapCount} />}
        {userEntry &&
          renderRow(userEntry, sortKey, activeTask, currentUserId)}
      </ul>

      {/* Footer caption */}
      <p className="mt-5 text-[12px] leading-[1.55] text-muted">
        {footerCaption}
      </p>
    </>
  );
}

/* ─── Row renderers ─────────────────────────────────────────────── */

type RankedEntry = {
  row: LeaderboardRow;
  stat: number | null;
  rank: number;
  topPct: number | null;
};

function renderRow(
  entry: RankedEntry,
  sortKey: SortKey,
  activeTask: LeaderboardTaskOption | null,
  currentUserId: string,
) {
  const { row, stat, rank, topPct } = entry;
  const isMe = row.userId === currentUserId;
  return (
    <li
      key={row.userId}
      className={`
        grid grid-cols-[40px_44px_1fr_auto_auto] gap-x-5 items-center
        py-5
        transition-colors duration-200 ease-out
        ${isMe
          ? "bg-oxblood/[0.08] border-l-[3px] border-oxblood pl-3 -ml-3 hover:bg-oxblood/[0.12]"
          : "hover:bg-parchment/40"
        }
      `}
    >
      <span
        className={`text-right text-[13px] tabular-nums ${isMe ? "text-oxblood font-medium" : "text-muted"}`}
      >
        {rank}
      </span>

      <span
        aria-hidden
        className={`
          w-9 h-9 rounded-full
          inline-flex items-center justify-center
          border font-display text-[12px] tracking-[0.04em]
          ${isMe
            ? "border-oxblood bg-oxblood text-cream"
            : "border-oxblood bg-parchment text-oxblood"
          }
        `}
      >
        {initialsFor(row.fullName)}
      </span>

      <div className="min-w-0">
        <p
          className={`text-[15px] tracking-[-0.005em] font-medium truncate ${isMe ? "text-oxblood" : "text-ink"}`}
        >
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

      <div className="text-right shrink-0">
        {stat === null ? (
          <span className="text-[12px] text-muted">No submissions yet</span>
        ) : (
          <p
            className="font-display text-[18px] leading-[1] text-oxblood tabular-nums"
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            {formatStat(stat, sortKey)}
          </p>
        )}
        {stat !== null && (
          <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
            {statLabel(stat, sortKey, activeTask)}
          </p>
        )}
      </div>

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
}

function EllipsisRow({ count }: { count: number }) {
  return (
    <li className="py-4 flex items-center justify-center gap-3 text-muted">
      <span aria-hidden className="text-[16px] tracking-[0.4em] leading-none">
        ···
      </span>
      <span className="text-[11px] tracking-[0.04em]">
        {count} {count === 1 ? "student" : "students"} between
      </span>
    </li>
  );
}

/* ─── Sort + display helpers ────────────────────────────────────── */

function statFor(
  row: LeaderboardRow,
  sortKey: SortKey,
  scopedTaskId: string | null,
): number | null {
  if (sortKey === "activity") return row.submissionCount;

  if (scopedTaskId) {
    const tb = row.taskScores[scopedTaskId];
    if (!tb) return null;
    if (sortKey === "overall" || sortKey === "avg") return tb.total;
    if (DIM_KEYS.has(sortKey)) return tb[sortKey as Dimension];
    return null;
  }

  if (sortKey === "overall") return row.overall;
  if (sortKey === "avg") return row.avgPerTask;
  if (DIM_KEYS.has(sortKey)) return row.aggregates[sortKey as Dimension];
  return null;
}

function formatStat(stat: number, sortKey: SortKey): string {
  if (sortKey === "activity") return String(stat);
  if (sortKey === "avg") return stat.toFixed(1);
  return String(Math.round(stat));
}

function statLabel(
  stat: number,
  sortKey: SortKey,
  activeTask: LeaderboardTaskOption | null,
): string {
  if (sortKey === "activity") return stat === 1 ? "submission" : "submissions";
  if (sortKey === "overall") return activeTask ? "task total" : "total";
  if (sortKey === "avg") return activeTask ? "task total" : "avg / task";
  return activeTask ? `${capitalize(sortKey)} on task` : "score";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "•";
}

/* ─── Editorial select dropdown ─────────────────────────────────── */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex flex-col min-w-[180px]">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            appearance-none
            w-full min-h-[44px] pl-4 pr-10
            border border-ink/25 bg-cream text-oxblood
            text-[14px] tracking-[-0.005em]
            outline-none cursor-pointer
            transition-colors duration-150 ease-out
            hover:border-oxblood focus:border-oxblood focus:ring-1 focus:ring-oxblood
          "
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={16}
          strokeWidth={1.6}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-oxblood pointer-events-none"
        />
      </div>
    </label>
  );
}
