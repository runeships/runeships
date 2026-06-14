"use client";

import { useState, useTransition } from "react";
import {
  adminTestPrompt,
  type TestPromptResult,
} from "@/app/actions/adminTestPrompt";

type Preset = { label: string; title: string; body: string };

const DEFAULT_BRIEF = `Write a customer-facing email announcing a 20% price increase, effective in 90 days. Plain text — no formatting beyond what's natural in an email. Lead with the news. Be honest about the reason. Stay under 250 words. Tone: direct, not corporate.`;

export function PromptTestForm({ cases }: { cases: Preset[] }) {
  const [taskBrief, setTaskBrief] = useState(DEFAULT_BRIEF);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<TestPromptResult>({ status: "idle" });

  function loadCase(c: Preset) {
    setTitle(c.title);
    setBody(c.body);
    setResult({ status: "idle" });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await adminTestPrompt(fd);
      setResult(r);
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {cases.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => loadCase(c)}
            disabled={pending}
            className="
              inline-flex items-center min-h-[32px] px-3
              bg-cream text-oxblood border border-oxblood/50
              text-[11px] tracking-[0.005em]
              hover:border-oxblood transition-colors duration-150 ease-out
              disabled:opacity-50
            "
          >
            Load #{i + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setBody("");
            setResult({ status: "idle" });
          }}
          disabled={pending}
          className="link-anim text-[12px] text-muted hover:text-ink disabled:opacity-50"
        >
          Clear
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="task-brief"
            className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
          >
            Task brief
          </label>
          <textarea
            id="task-brief"
            name="task_brief"
            rows={5}
            value={taskBrief}
            onChange={(e) => setTaskBrief(e.target.value)}
            disabled={pending}
            className={textareaCls}
          />
        </div>

        <div>
          <label
            htmlFor="sub-title"
            className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
          >
            Submission title
          </label>
          <input
            id="sub-title"
            name="submission_title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={pending}
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="sub-body"
            className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2"
          >
            Submission body
          </label>
          <textarea
            id="sub-body"
            name="submission_body"
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
            className={textareaCls}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="
            inline-flex items-center min-h-[44px] px-6
            bg-oxblood text-cream border border-oxblood
            text-[14px] tracking-[0.01em] font-medium
            hover:bg-oxblood-hover transition-colors duration-200 ease-out
            disabled:opacity-60
          "
        >
          {pending ? "Running…" : "Run grading"}
        </button>
      </form>

      {result.status === "error" && (
        <p role="alert" className="mt-6 text-[13px] text-oxblood">
          {result.message}
        </p>
      )}

      {result.status === "success" && (
        <section className="mt-10 pt-8 border-t border-ink/10">
          <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood mb-4">
            Result
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 max-w-[480px]">
            <ScoreCell label="Strategy" value={result.scores.strategy} />
            <ScoreCell label="Execution" value={result.scores.execution} />
            <ScoreCell label="Communication" value={result.scores.communication} />
            <ScoreCell label="Technical" value={result.scores.technical} />
            <ScoreCell label="Creativity" value={result.scores.creativity} />
          </div>
          <div className="mt-8">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
              Qualitative feedback
            </p>
            <pre className="whitespace-pre-wrap break-words border border-ink/15 bg-cream p-4 sm:p-5 text-[14px] leading-[1.6] text-ink font-body">
{result.qualitativeFeedback}
            </pre>
          </div>
          <p className="mt-4 text-[11px] text-muted">
            {result.modelUsed} · {result.inputTokens.toLocaleString()} in /{" "}
            {result.outputTokens.toLocaleString()} out tokens
          </p>
        </section>
      )}
    </>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.06em] uppercase text-muted">
        {label}
      </p>
      <p
        className="mt-1 font-display text-[22px] tabular-nums tracking-[-0.01em] leading-[1] text-oxblood"
        style={{ fontVariationSettings: '"opsz" 96' }}
      >
        {value}
      </p>
    </div>
  );
}

const inputCls = `
  w-full min-h-[48px] px-4 py-2.5
  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
  text-[14px] tracking-[-0.005em] leading-[1.5]
  outline-none transition-colors duration-150 ease-out
  focus:border-oxblood focus:ring-1 focus:ring-oxblood
  disabled:opacity-60
`;
const textareaCls = `${inputCls} resize-y font-mono text-[13px]`;
