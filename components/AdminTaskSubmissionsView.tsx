"use client";

import { useMemo, useState } from "react";
import {
  releaseSubmissionToCompany,
  unreleaseSubmission,
} from "@/app/actions/releaseSubmission";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { timeAgo } from "@/lib/format";

type Dim = "strategy" | "execution" | "communication" | "technical" | "creativity";
type SortKey = "overall" | Dim | "newest";

export type AdminTaskSubmissionRow = {
  submissionId: string;
  submissionTitle: string;
  submissionBody: string | null;
  supportingLink: string | null;
  createdAt: string;
  releasedToCompany: boolean;
  releasedAt: string | null;
  studentName: string;
  studentEmail: string | null;
  studentSchool: string | null;
  studentGradYear: number | null;
  studentIsSeed: boolean;
  scores: {
    strategy: number;
    execution: number;
    communication: number;
    technical: number;
    creativity: number;
    total: number;
  } | null;
  qualitativeFeedback: string | null;
  modelUsed: string | null;
  generatedAt: string | null;
};

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
  { key: "newest", label: "Newest" },
];

type Filter = "all" | "real" | "seed";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All students" },
  { key: "real", label: "Real students only" },
  { key: "seed", label: "Seed personas only" },
];

export function AdminTaskSubmissionsView({
  taskBrief,
  rows,
}: {
  taskBrief: string;
  rows: AdminTaskSubmissionRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("overall");
  const [filter, setFilter] = useState<Filter>("all");
  const [showBrief, setShowBrief] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const realCount = rows.filter((r) => !r.studentIsSeed).length;
  const seedCount = rows.length - realCount;

  const sorted = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (filter === "all") return true;
      if (filter === "real") return !r.studentIsSeed;
      return r.studentIsSeed;
    });
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortKey === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      const av = a.scores
        ? sortKey === "overall"
          ? a.scores.total
          : a.scores[sortKey]
        : -1;
      const bv = b.scores
        ? sortKey === "overall"
          ? b.scores.total
          : b.scores[sortKey]
        : -1;
      return bv - av;
    });
    return copy.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, sortKey, filter]);

  if (rows.length === 0) {
    return (
      <p className="text-[14px] text-muted italic">
        No submissions for this task yet.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowBrief((v) => !v)}
        className="text-[11px] tracking-[0.18em] uppercase text-oxblood link-anim hover:text-oxblood-hover transition-colors duration-200 ease-out"
      >
        {showBrief ? "Hide" : "Show"} task brief {showBrief ? "↑" : "↓"}
      </button>
      {showBrief && (
        <div className="mt-4 border-l-2 border-oxblood/40 pl-5 max-w-[68ch]">
          {taskBrief.trim() ? (
            <EditorialMarkdown content={taskBrief} />
          ) : (
            <p className="text-[14px] text-muted italic">
              (No brief provided.)
            </p>
          )}
        </div>
      )}

      <p className="mt-7 text-[12px] tracking-[0.04em] uppercase text-muted">
        {realCount} real {realCount === 1 ? "student" : "students"}
        {seedCount > 0 && (
          <>
            <span aria-hidden className="mx-2 text-muted/50">·</span>
            <span className="text-ink/40">{seedCount} seed</span>
          </>
        )}
      </p>

      <nav
        aria-label="Filter"
        className="mt-3 flex flex-wrap gap-2"
      >
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

      <nav
        aria-label="Sort"
        className="mt-3 flex flex-wrap gap-2"
      >
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSortKey(opt.key)}
            aria-pressed={opt.key === sortKey}
            className={`
              inline-flex items-center min-h-[32px] px-3
              border text-[12px] tracking-[-0.005em]
              transition-colors duration-150 ease-out
              ${opt.key === sortKey
                ? "bg-ink/15 text-ink border-ink/30"
                : "bg-cream text-muted border-ink/15 hover:text-ink hover:border-ink/40"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </nav>

      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {sorted.map((r) => {
          const expanded = expandedId === r.submissionId;
          const displayedScore =
            r.scores && sortKey !== "newest"
              ? sortKey === "overall"
                ? Math.round(r.scores.total)
                : r.scores[sortKey as Dim]
              : r.scores
              ? Math.round(r.scores.total)
              : null;
          const scoreLabel = sortKey === "newest" ? "total" : sortKey;

          return (
            <li key={r.submissionId}>
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expanded ? null : r.submissionId)
                }
                className="
                  w-full text-left py-5 grid grid-cols-[24px_32px_1fr_auto_auto] gap-x-4 items-center
                  hover:bg-parchment/60 transition-colors duration-200 ease-out -mx-3 px-3
                "
              >
                <span aria-hidden className="text-muted shrink-0">
                  {expanded ? (
                    <ChevronDown size={14} strokeWidth={1.8} />
                  ) : (
                    <ChevronRight size={14} strokeWidth={1.8} />
                  )}
                </span>
                <span className="text-right text-[13px] tabular-nums text-muted">
                  {r.rank}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p
                      className={`text-[15px] tracking-[-0.005em] font-medium truncate ${r.studentIsSeed ? "text-ink/55" : "text-ink"}`}
                    >
                      {r.studentName}
                    </p>
                    {r.studentIsSeed && (
                      <span className="inline-flex items-center px-2 min-h-[18px] bg-ink/10 text-ink/60 text-[10px] tracking-[0.04em] uppercase">
                        Seed
                      </span>
                    )}
                    {r.releasedToCompany ? (
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-muted">
                        <CheckCircle2 size={11} strokeWidth={1.8} />
                        Released
                      </span>
                    ) : r.scores === null ? (
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.06em] uppercase text-oxblood">
                        <AlertTriangle size={11} strokeWidth={1.8} />
                        No AI score
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] text-muted truncate">
                    {r.studentSchool ?? "(no school)"}
                    {r.studentGradYear && (
                      <>
                        <span aria-hidden className="mx-2 text-muted/50">·</span>
                        Class of {r.studentGradYear}
                      </>
                    )}
                    <span aria-hidden className="mx-2 text-muted/50">·</span>
                    Submitted {timeAgo(r.createdAt)}
                  </p>
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
                <span className="text-[11px] tracking-[0.04em] uppercase text-muted shrink-0">
                  {expanded ? "Hide" : "View"}
                </span>
              </button>

              {expanded && (
                <ExpandedDetail row={r} />
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-[12px] text-muted">
        {sorted.length} submission{sorted.length === 1 ? "" : "s"} ·{" "}
        {sorted.filter((r) => r.releasedToCompany).length} released
      </p>
    </>
  );
}

function ExpandedDetail({ row }: { row: AdminTaskSubmissionRow }) {
  return (
    <div className="py-6 px-3 -mx-3 bg-parchment/30 border-t border-ink/10">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-x-10 gap-y-8">
        {/* LEFT: student's submission */}
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            What the student submitted
          </p>
          <h3
            className="mt-3 font-display font-light text-[20px] sm:text-[22px] leading-[1.2] text-ink"
          >
            {row.submissionTitle || "(no title)"}
          </h3>
          {row.studentEmail && (
            <p className="mt-2 text-[12px] text-muted">
              {row.studentEmail}
            </p>
          )}
          {row.supportingLink && (
            <a
              href={row.supportingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out underline decoration-oxblood/40 underline-offset-[3px] break-all"
            >
              <ExternalLink size={12} strokeWidth={1.8} className="shrink-0" />
              {row.supportingLink}
            </a>
          )}
          {row.submissionBody?.trim() ? (
            <div className="mt-5">
              <EditorialMarkdown content={row.submissionBody} />
            </div>
          ) : (
            <p className="mt-5 text-[13px] text-muted italic">
              (No body — link-only submission.)
            </p>
          )}
        </div>

        {/* RIGHT: feedback + release controls */}
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            What we&rsquo;ll send the company
          </p>

          {row.scores ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 max-w-[320px]">
                <ScoreCell label="Strategy" value={row.scores.strategy} />
                <ScoreCell label="Execution" value={row.scores.execution} />
                <ScoreCell label="Communication" value={row.scores.communication} />
                <ScoreCell label="Technical" value={row.scores.technical} />
                <ScoreCell label="Creativity" value={row.scores.creativity} />
                <ScoreCell
                  label="Total"
                  value={Math.round(row.scores.total)}
                  emphasized
                />
              </div>
              {row.qualitativeFeedback && (
                <div className="mt-7">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
                    Feedback
                  </p>
                  <EditorialMarkdown content={row.qualitativeFeedback} />
                </div>
              )}
              {row.modelUsed && (
                <p className="mt-5 text-[11px] text-muted">
                  Scored by {row.modelUsed}
                  {row.generatedAt && (
                    <> · {timeAgo(row.generatedAt)}</>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="mt-4 text-[13px] leading-[1.55] text-muted max-w-[58ch]">
              No AI feedback. The task&rsquo;s token budget was exhausted before
              this submission could be graded. Release as-is (company sees a
              submission with no score) or skip — your call.
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-ink/10 flex items-center gap-5">
            {row.releasedToCompany ? (
              <>
                <form action={unreleaseSubmission}>
                  <input
                    type="hidden"
                    name="submission_id"
                    value={row.submissionId}
                  />
                  <button
                    type="submit"
                    className="
                      inline-flex items-center min-h-[40px] px-5
                      border border-oxblood text-oxblood text-[13px]
                      hover:bg-oxblood hover:text-cream
                      transition-colors duration-200 ease-out
                    "
                  >
                    Unrelease
                  </button>
                </form>
                {row.releasedAt && (
                  <p className="text-[12px] text-muted">
                    Released {timeAgo(row.releasedAt)}
                  </p>
                )}
              </>
            ) : (
              <form action={releaseSubmissionToCompany}>
                <input
                  type="hidden"
                  name="submission_id"
                  value={row.submissionId}
                />
                <button
                  type="submit"
                  className="
                    inline-flex items-center min-h-[44px] px-5
                    bg-oxblood text-cream border border-oxblood
                    text-[13px] tracking-[0.01em] font-medium
                    hover:bg-oxblood-hover transition-colors duration-200 ease-out
                  "
                >
                  Send to company
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreCell({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.06em] uppercase text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-display tabular-nums tracking-[-0.01em] leading-[1] ${emphasized ? "text-[26px] text-oxblood" : "text-[20px] text-ink"}`}
        style={{ fontVariationSettings: '"opsz" 96' }}
      >
        {value}
      </p>
    </div>
  );
}
