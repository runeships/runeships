"use client";

import { useActionState, useState } from "react";
import {
  resolveRegrade,
  type ResolveRegradeState,
} from "@/app/actions/resolveRegrade";

const initial: ResolveRegradeState = { status: "idle" };

type AdminRegradeRow = {
  regradeId: string;
  submissionId: string;
  studentEmail: string;
  studentName: string | null;
  taskTitle: string;
  companyName: string;
  submissionTitle: string;
  submissionBody: string | null;
  supportingLink: string | null;
  requestedAt: string;
  feedback: {
    score_strategy: number;
    score_execution: number;
    score_communication: number;
    score_technical: number;
    score_creativity: number;
    total_score: number;
    qualitative_feedback: string;
  };
};

/**
 * Inline admin form for triaging a single regrade request. Starts
 * collapsed (showing student + task + current score), expands on
 * "Review" with editable score inputs prefilled with the AI grade
 * and the existing qualitative feedback. Admin either:
 *   - "Save new scores" → status becomes 'resolved', feedback row
 *     overwritten, model_used switches to 'human-review'.
 *   - "Decline (keep AI scores)" → status becomes 'declined', AI
 *     scores stay intact. The decline note is optional context.
 */
export function RegradeAdminRow({ row }: { row: AdminRegradeRow }) {
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(
    resolveRegrade,
    initial,
  );
  const [resolution, setResolution] = useState<"resolved" | "declined">(
    "resolved",
  );

  const requestedDate = new Date(row.requestedAt).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );

  if (state.status === "success") {
    return (
      <div className="border border-ink/15 bg-cream p-7 rounded-[2px]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          {state.resolution === "resolved"
            ? "Scores updated"
            : "Request declined"}
        </p>
        <p className="mt-3 text-[15px] text-ink/85">
          {row.studentEmail} · {row.taskTitle}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-ink/15 bg-cream rounded-[2px]">
      {/* Collapsed summary header */}
      <div className="p-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-start">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            {requestedDate} · {row.companyName}
          </p>
          <h3 className="mt-2 font-display font-normal text-[19px] sm:text-[21px] leading-[1.2] tracking-[-0.01em] text-ink">
            {row.taskTitle}
          </h3>
          <p className="mt-2 text-[14px] text-muted">
            {row.studentName ? `${row.studentName} · ` : ""}
            {row.studentEmail}
          </p>
        </div>
        <div className="flex items-baseline gap-4 md:flex-col md:items-end md:gap-1">
          <p className="text-[11px] tracking-[0.16em] uppercase text-muted">
            Current grade
          </p>
          <p
            className="font-display text-[28px] leading-[1] text-ink tabular-nums"
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            {Math.round(row.feedback.total_score)}
          </p>
        </div>
      </div>

      {!expanded ? (
        <div className="px-7 pb-7 flex flex-wrap gap-x-7 gap-y-3 items-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="
              inline-flex items-center min-h-[44px] px-5
              bg-oxblood text-cream border border-oxblood
              text-[14px] tracking-[0.01em] font-medium
              transition-colors duration-200 ease-out
              hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            "
          >
            Review
          </button>
        </div>
      ) : (
        <form action={formAction} className="px-7 pb-7 space-y-7">
          <input type="hidden" name="regrade_id" value={row.regradeId} />
          <input type="hidden" name="resolution" value={resolution} />

          {/* Submission preview */}
          <div className="border-l-2 border-ink/15 pl-5">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
              Submission · {row.submissionTitle}
            </p>
            {row.submissionBody && (
              <div className="mt-3 text-[14px] leading-[1.6] text-ink/85 whitespace-pre-line max-h-[280px] overflow-auto">
                {row.submissionBody}
              </div>
            )}
            {row.supportingLink && (
              <p className="mt-3 text-[13px]">
                <a
                  href={row.supportingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-anim text-ink hover:text-oxblood transition-colors duration-200 ease-out break-all"
                >
                  {row.supportingLink}
                </a>
              </p>
            )}
          </div>

          {/* Scores */}
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
              Adjust scores (0–100)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <ScoreInput
                label="Strategy"
                name="score_strategy"
                defaultValue={row.feedback.score_strategy}
              />
              <ScoreInput
                label="Execution"
                name="score_execution"
                defaultValue={row.feedback.score_execution}
              />
              <ScoreInput
                label="Communication"
                name="score_communication"
                defaultValue={row.feedback.score_communication}
              />
              <ScoreInput
                label="Technical"
                name="score_technical"
                defaultValue={row.feedback.score_technical}
              />
              <ScoreInput
                label="Creativity"
                name="score_creativity"
                defaultValue={row.feedback.score_creativity}
              />
            </div>
            <p className="mt-3 text-[12px] text-muted">
              Total is recomputed from the task&rsquo;s per-dimension weights.
            </p>
          </div>

          {/* Qualitative feedback */}
          <div>
            <label
              htmlFor={`qf-${row.regradeId}`}
              className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
            >
              Written feedback (replaces AI version on save)
            </label>
            <textarea
              id={`qf-${row.regradeId}`}
              name="qualitative_feedback"
              rows={8}
              defaultValue={row.feedback.qualitative_feedback}
              className="
                w-full px-4 py-3
                border border-ink/25 bg-cream text-ink
                text-[14px] leading-[1.6]
                outline-none resize-y
                transition-colors duration-150 ease-out
                focus:border-oxblood focus:ring-1 focus:ring-oxblood
              "
            />
          </div>

          {/* Admin note (internal) */}
          <div>
            <label
              htmlFor={`note-${row.regradeId}`}
              className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
            >
              Internal note (optional, not shown to student)
            </label>
            <input
              id={`note-${row.regradeId}`}
              name="admin_note"
              type="text"
              placeholder="Why you adjusted or declined — for your own records."
              className="
                w-full min-h-[48px] px-4
                border border-ink/25 bg-cream text-ink placeholder:text-muted/80
                text-[14px]
                outline-none
                transition-colors duration-150 ease-out
                focus:border-oxblood focus:ring-1 focus:ring-oxblood
              "
            />
          </div>

          {state.status === "error" && (
            <p
              role="alert"
              className="text-[14px] leading-snug text-oxblood"
            >
              {state.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-2 border-t border-ink/10">
            <button
              type="submit"
              disabled={pending}
              onClick={() => setResolution("resolved")}
              className={`
                inline-flex items-center min-h-[48px] px-7
                bg-oxblood text-cream border border-oxblood
                text-[14px] tracking-[0.01em] font-medium
                transition-colors duration-200 ease-out
                hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
                disabled:opacity-50 disabled:cursor-not-allowed
                ${pending ? "btn-pulse" : ""}
              `}
            >
              {pending && resolution === "resolved"
                ? "Saving…"
                : "Save new scores"}
            </button>
            <button
              type="submit"
              disabled={pending}
              onClick={() => setResolution("declined")}
              className="
                inline-flex items-center min-h-[44px] px-5
                bg-transparent text-ink border border-ink/30
                text-[13px] tracking-[0.02em] font-medium
                transition-colors duration-200 ease-out
                hover:border-ink hover:text-ink
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {pending && resolution === "declined"
                ? "Declining…"
                : "Decline (keep AI scores)"}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              disabled={pending}
              className="
                link-anim text-[13px] tracking-[0.005em] text-muted
                hover:text-ink transition-colors duration-200 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Collapse
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ScoreInput({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <div>
      <label
        htmlFor={`${name}-input`}
        className="block text-[11px] tracking-[0.04em] text-muted mb-1.5"
      >
        {label}
      </label>
      <input
        id={`${name}-input`}
        name={name}
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        defaultValue={defaultValue}
        required
        className="
          w-full min-h-[48px] px-3
          border border-ink/25 bg-cream text-ink
          text-[15px] tabular-nums tracking-[-0.005em]
          outline-none
          transition-colors duration-150 ease-out
          focus:border-oxblood focus:ring-1 focus:ring-oxblood
        "
      />
    </div>
  );
}
