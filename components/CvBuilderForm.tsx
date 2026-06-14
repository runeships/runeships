"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Sparkles, Lock } from "lucide-react";
import { buildCvBullet } from "@/app/actions/buildCvBullet";
import {
  hoursUntilNextCvBuild,
  isInCvBuildCooldown,
  CV_BUILD_COOLDOWN_MS,
} from "@/lib/resumeCode";

type TaskRow = {
  taskId: string;
  title: string;
  companyName: string;
  category: string;
  totalScore: number;
  completedAt: string;
  completedAtRelative: string;
};

export function CvBuilderForm({
  tasks,
  initialLastResumeAt,
}: {
  tasks: TaskRow[];
  initialLastResumeAt: string | null;
}) {
  // Default: all tasks selected. Most users will want the full list.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(tasks.map((t) => t.taskId)),
  );
  const [pending, startTransition] = useTransition();
  const [block, setBlock] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lastResumeAt, setLastResumeAt] = useState(initialLastResumeAt);

  const locked = isInCvBuildCooldown(lastResumeAt);
  const hoursLeft = hoursUntilNextCvBuild(lastResumeAt);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Stale preview should be cleared when selection changes.
    if (block) setBlock(null);
  }

  function selectAll() {
    setSelected(new Set(tasks.map((t) => t.taskId)));
    if (block) setBlock(null);
  }
  function selectNone() {
    setSelected(new Set());
    if (block) setBlock(null);
  }

  function handleGenerate() {
    if (locked) return;
    setError(null);
    const taskIds = Array.from(selected);
    startTransition(async () => {
      const result = await buildCvBullet(taskIds);
      if (result.status === "success") {
        setBlock(result.block);
        // Engage cooldown immediately on the client so the button
        // locks before the next paint.
        setLastResumeAt(new Date().toISOString());
      } else if (result.status === "error") {
        if (result.reason === "cooldown" && result.nextAvailableAt) {
          // Server won the race — reconcile cooldown locally.
          setLastResumeAt(
            new Date(
              new Date(result.nextAvailableAt).getTime() -
                CV_BUILD_COOLDOWN_MS,
            ).toISOString(),
          );
        }
        setError(result.message);
      }
    });
  }

  async function copyToClipboard() {
    if (!block) return;
    try {
      await navigator.clipboard.writeText(block);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — user can manually select+copy
    }
  }

  const allSelected = selected.size === tasks.length;
  const noneSelected = selected.size === 0;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
          Your completed tasks · {tasks.length}
        </p>
        <div className="flex items-center gap-4 text-[12px]">
          <button
            type="button"
            onClick={selectAll}
            disabled={allSelected || pending}
            className="link-anim text-muted hover:text-ink transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Select all
          </button>
          <span aria-hidden className="text-muted/40">|</span>
          <button
            type="button"
            onClick={selectNone}
            disabled={noneSelected || pending}
            className="link-anim text-muted hover:text-ink transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {tasks.map((t) => {
          const isSelected = selected.has(t.taskId);
          return (
            <li key={t.taskId}>
              <label
                className={`
                  flex items-start gap-4 py-4 cursor-pointer
                  -mx-3 px-3 transition-colors duration-150 ease-out
                  ${isSelected ? "bg-parchment/40" : "hover:bg-parchment/30"}
                `}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(t.taskId)}
                  disabled={pending}
                  className="mt-1 accent-oxblood"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] tracking-[-0.005em] text-ink font-medium truncate">
                    {t.title}
                  </p>
                  <p className="mt-1 text-[12px] text-muted truncate">
                    {t.companyName}
                    <span aria-hidden className="mx-2 text-muted/50">·</span>
                    {t.category}
                    <span aria-hidden className="mx-2 text-muted/50">·</span>
                    Completed {t.completedAtRelative}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="font-display text-[20px] leading-[1] text-oxblood tabular-nums"
                    style={{ fontVariationSettings: '"opsz" 96' }}
                  >
                    {t.totalScore}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.04em] text-muted">
                    score
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Generate button */}
      <div className="mt-8 flex items-center gap-5 flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending || locked}
          aria-busy={pending}
          aria-disabled={locked}
          title={
            locked
              ? `Available again in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`
              : undefined
          }
          className={`
            inline-flex items-center gap-2 min-h-[48px] px-6
            border text-[14px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            disabled:cursor-not-allowed
            ${locked
              ? "bg-ink/10 text-ink/45 border-ink/15"
              : "bg-oxblood text-cream border-oxblood hover:bg-oxblood-hover disabled:opacity-60"
            }
          `}
        >
          {locked ? (
            <Lock size={14} strokeWidth={1.8} aria-hidden />
          ) : (
            <Sparkles size={14} strokeWidth={1.8} aria-hidden />
          )}
          {locked
            ? `Available in ${hoursLeft}h`
            : pending
            ? "Generating…"
            : block
            ? "Regenerate"
            : "Generate CV block"}
        </button>
        <p className="text-[12px] text-muted">
          {selected.size} task{selected.size === 1 ? "" : "s"} selected
        </p>
      </div>

      {locked && !error && (
        <p className="mt-3 text-[12px] leading-[1.55] text-muted max-w-[58ch]">
          You can regenerate once per day — keeps the per-task summaries from
          burning through API credits and gives recent task work time to settle.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-oxblood">
          {error}
        </p>
      )}

      {/* Preview */}
      {block && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
              Your CV block
            </p>
            <button
              type="button"
              onClick={copyToClipboard}
              className="
                inline-flex items-center gap-1.5 min-h-[34px] px-3
                bg-oxblood text-cream border border-oxblood
                text-[12px] tracking-[0.01em]
                hover:bg-oxblood-hover transition-colors duration-200 ease-out
              "
            >
              {copied ? (
                <>
                  <Check size={11} strokeWidth={1.8} aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={11} strokeWidth={1.8} aria-hidden />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre
            className="
              whitespace-pre-wrap break-words
              border border-ink/15 bg-cream p-5 sm:p-6
              text-[14px] leading-[1.6] text-ink font-body
            "
          >
{block}
          </pre>
          <p className="mt-3 text-[11px] leading-[1.55] text-muted max-w-[62ch]">
            Paste it into your CV under an &ldquo;Experience&rdquo; or
            &ldquo;Activities&rdquo; section. Trim or rewrite any line that
            doesn&rsquo;t match your voice — the verification URL stays valid
            even if you edit the surrounding text.
          </p>
        </section>
      )}
    </>
  );
}
