"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  releaseSubmissionToCompany,
  unreleaseSubmission,
} from "@/app/actions/releaseSubmission";
import { ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";

type Dim = "strategy" | "execution" | "communication" | "technical" | "creativity";
type SortKey = "newest" | "overall" | Dim;
type Filter = "all" | "pending" | "released" | "no_score";

export type AdminSubmissionRow = {
  submissionId: string;
  submissionTitle: string;
  supportingLink: string | null;
  createdAt: string;
  releasedToCompany: boolean;
  releasedAt: string | null;
  taskId: string | null;
  taskTitle: string;
  companyName: string;
  budgetExhausted: boolean;
  studentName: string;
  studentSchool: string | null;
  studentGradYear: number | null;
  scores: {
    strategy: number;
    execution: number;
    communication: number;
    technical: number;
    creativity: number;
    total: number;
  } | null;
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "overall", label: "Overall" },
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
];

const FILTER_OPTIONS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending release" },
  { key: "released", label: "Released" },
  { key: "no_score", label: "Needs manual scoring" },
];

export function AdminSubmissionsList({ rows }: { rows: AdminSubmissionRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (filter === "all") return true;
      if (filter === "pending") return !r.releasedToCompany;
      if (filter === "released") return r.releasedToCompany;
      if (filter === "no_score") return r.scores === null;
      return true;
    });
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortKey === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      const av = a.scores ? (sortKey === "overall" ? a.scores.total : a.scores[sortKey]) : -1;
      const bv = b.scores ? (sortKey === "overall" ? b.scores.total : b.scores[sortKey]) : -1;
      return bv - av;
    });
    return copy;
  }, [rows, sortKey, filter]);

  const pendingCount = rows.filter((r) => !r.releasedToCompany).length;

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
          All submissions
        </h1>
        <p className="mt-3 text-[13px] leading-[1.55] text-muted max-w-[68ch]">
          {rows.length} total · {pendingCount} pending release. Companies
          don&rsquo;t see a submission until you release it. Scores come from
          the AI grader when budget allows — exhausted tasks land here
          un-scored for manual review.
        </p>
      </header>

      <nav aria-label="Filter" className="mt-8 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.key}
            label={opt.label}
            active={opt.key === filter}
            onClick={() => setFilter(opt.key)}
          />
        ))}
      </nav>

      <nav aria-label="Sort" className="mt-3 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <Chip
            key={opt.key}
            label={opt.label}
            active={opt.key === sortKey}
            onClick={() => setSortKey(opt.key)}
            tone="muted"
          />
        ))}
      </nav>

      {visible.length === 0 ? (
        <p className="mt-10 text-[14px] text-muted italic">
          No submissions match.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {visible.map((r) => (
            <Row key={r.submissionId} row={r} sortKey={sortKey} />
          ))}
        </ul>
      )}
    </>
  );
}

function Row({
  row,
  sortKey,
}: {
  row: AdminSubmissionRow;
  sortKey: SortKey;
}) {
  const displayedScore =
    row.scores && sortKey !== "newest"
      ? sortKey === "overall"
        ? Math.round(row.scores.total)
        : row.scores[sortKey as Dim]
      : null;
  const scoreLabel = sortKey === "newest" ? "total" : sortKey;

  return (
    <li className="py-5 grid grid-cols-[1fr_auto_auto] gap-x-6 items-start">
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
            {row.studentName}
          </p>
          {row.releasedToCompany ? (
            <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-muted">
              <CheckCircle2 size={11} strokeWidth={1.8} />
              Released
            </span>
          ) : row.budgetExhausted && row.scores === null ? (
            <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-oxblood">
              <AlertTriangle size={11} strokeWidth={1.8} />
              AI budget exhausted — score manually
            </span>
          ) : row.scores === null ? (
            <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-muted">
              Awaiting AI scoring
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-[12px] text-muted truncate">
          {row.taskTitle}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          {row.companyName}
          {row.studentSchool && (
            <>
              <span aria-hidden className="mx-2 text-muted/50">·</span>
              {row.studentSchool}
            </>
          )}
          {row.studentGradYear && (
            <>
              <span aria-hidden className="mx-2 text-muted/50">·</span>
              Class of {row.studentGradYear}
            </>
          )}
        </p>
        {row.supportingLink && (
          <a
            href={row.supportingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[12px] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out underline decoration-oxblood/40 underline-offset-[3px]"
          >
            <ExternalLink size={11} strokeWidth={1.8} />
            {prettifyLink(row.supportingLink)}
          </a>
        )}
      </div>

      <div className="text-right shrink-0">
        {displayedScore !== null ? (
          <>
            <p
              className="font-display text-[20px] leading-[1] text-oxblood tabular-nums"
              style={{ fontVariationSettings: '"opsz" 96' }}
            >
              {displayedScore}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
              {scoreLabel}
            </p>
          </>
        ) : (
          <span className="text-[11px] text-muted">—</span>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2">
        <Link
          href={`/admin/review/${row.submissionId}`} prefetch={false}
          className="link-anim text-[12px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
        >
          View
        </Link>
        {row.releasedToCompany ? (
          <form action={unreleaseSubmission}>
            <input type="hidden" name="submission_id" value={row.submissionId} />
            <button
              type="submit"
              className="text-[12px] tracking-[0.005em] text-muted hover:text-oxblood transition-colors duration-200 ease-out link-anim"
            >
              Unrelease
            </button>
          </form>
        ) : (
          <form action={releaseSubmissionToCompany}>
            <input type="hidden" name="submission_id" value={row.submissionId} />
            <button
              type="submit"
              className="
                inline-flex items-center min-h-[32px] px-3
                bg-oxblood text-cream border border-oxblood text-[11px] tracking-[0.04em] uppercase
                hover:bg-oxblood-hover transition-colors duration-200 ease-out
              "
            >
              Send to company
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

function Chip({
  label,
  active,
  onClick,
  tone = "primary",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "primary" | "muted";
}) {
  const inactiveCls =
    tone === "primary"
      ? "bg-cream text-oxblood border-oxblood/50 hover:border-oxblood"
      : "bg-cream text-muted border-ink/15 hover:text-ink hover:border-ink/40";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`
        inline-flex items-center min-h-[32px] px-3
        border text-[12px] tracking-[-0.005em]
        transition-colors duration-150 ease-out
        ${active ? "bg-oxblood text-cream border-oxblood" : inactiveCls}
      `}
    >
      {label}
    </button>
  );
}

function prettifyLink(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname.length > 1 ? u.pathname : ""}`.slice(
      0,
      60,
    );
  } catch {
    return url.slice(0, 60);
  }
}
