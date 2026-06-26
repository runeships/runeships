"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  saveHumanFeedback,
  type SaveHumanFeedbackState,
} from "@/app/actions/saveHumanFeedback";

const initial: SaveHumanFeedbackState = { status: "idle" };

type Weights = {
  strategy: number;
  execution: number;
  communication: number;
  technical: number;
  creativity: number;
};

const DIMENSIONS: Array<{ key: keyof Weights; label: string }> = [
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
];

/**
 * Admin scoring form. Five score inputs (0–100), a textarea for
 * qualitative feedback, and a live-computed weighted total that
 * updates as the scores change. Submits via saveHumanFeedback,
 * which validates, persists, and emails the student.
 */
export function ReviewForm({
  submissionId,
  weights,
}: {
  submissionId: string;
  weights: Weights;
}) {
  const [state, formAction, pending] = useActionState(
    saveHumanFeedback,
    initial,
  );
  const [scores, setScores] = useState<Record<string, string>>({
    strategy: "",
    execution: "",
    communication: "",
    technical: "",
    creativity: "",
  });
  const [feedback, setFeedback] = useState("");

  // Live total — only valid when every dim has a parsable value.
  const parsed = parseScores(scores);
  const liveTotal =
    parsed === null
      ? null
      : Math.round(
          (parsed.strategy * weights.strategy +
            parsed.execution * weights.execution +
            parsed.communication * weights.communication +
            parsed.technical * weights.technical +
            parsed.creativity * weights.creativity) *
            10,
        ) / 10;

  const canSubmit =
    parsed !== null && feedback.trim().length > 0 && !pending;

  return (
    <form action={formAction} className="space-y-7">
      <input type="hidden" name="submission_id" value={submissionId} />

      {/* Score inputs */}
      <div>
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
          Scores (0–100)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {DIMENSIONS.map((d) => {
            const w = weights[d.key];
            return (
              <div key={d.key}>
                <label
                  htmlFor={`score-${d.key}`}
                  className="block text-[13px] tracking-[-0.005em] text-ink mb-1.5"
                >
                  {d.label}
                </label>
                <input
                  id={`score-${d.key}`}
                  name={`score_${d.key}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  step={1}
                  value={scores[d.key]}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [d.key]: e.target.value,
                    }))
                  }
                  disabled={pending}
                  required
                  className="
                    w-full min-h-[44px] px-3
                    border border-ink/25 bg-cream text-oxblood
                    text-[18px] tabular-nums tracking-[-0.005em]
                    outline-none
                    transition-colors duration-150 ease-out
                    focus:border-oxblood focus:ring-1 focus:ring-oxblood
                    disabled:opacity-60 disabled:cursor-not-allowed
                  "
                />
                <p className="mt-1 text-[11px] tracking-[0.04em] text-muted">
                  {Math.round(w * 100)}% weight
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live weighted total */}
      <div className="border-l-2 border-oxblood pl-4 py-1">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
          Weighted total
        </p>
        <p
          className="mt-1 font-display text-[28px] leading-[1] text-oxblood tabular-nums tracking-[-0.012em]"
          style={{ fontVariationSettings: '"opsz" 96' }}
        >
          {liveTotal === null ? "·" : liveTotal.toFixed(1)}
        </p>
      </div>

      {/* Qualitative feedback */}
      <div>
        <label
          htmlFor="qualitative-feedback"
          className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
        >
          Qualitative feedback
        </label>
        <textarea
          id="qualitative-feedback"
          name="qualitative_feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={10}
          maxLength={4000}
          placeholder="200–400 words. Specific strengths, areas for improvement, what you noticed."
          disabled={pending}
          required
          className="
            w-full px-4 py-3
            border border-ink/25 bg-cream text-ink placeholder:text-muted/80
            text-[14px] leading-[1.65]
            outline-none resize-y
            transition-colors duration-150 ease-out
            focus:border-oxblood focus:ring-1 focus:ring-oxblood
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        />
        <p className="mt-1.5 text-right text-[11px] tabular-nums text-muted">
          {feedback.length}/4000
        </p>
      </div>

      {state.status === "error" && (
        <p
          role="alert"
          className="text-[14px] leading-snug text-oxblood"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-5 pt-2 border-t border-ink/10">
        <Link
          href="/admin"
          className="link-anim text-[14px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={pending}
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
          {pending ? "Saving…" : "Save feedback"}
        </button>
      </div>
    </form>
  );
}

function parseScores(
  scores: Record<string, string>,
): Weights | null {
  const result = {} as Weights;
  for (const dim of [
    "strategy",
    "execution",
    "communication",
    "technical",
    "creativity",
  ] as const) {
    const raw = scores[dim];
    if (!raw || raw.trim() === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    result[dim] = Math.round(n);
  }
  return result;
}
