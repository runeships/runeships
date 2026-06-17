"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { createTask, type CreateTaskState } from "@/app/actions/createTask";

const initial: CreateTaskState = { status: "idle" };

const SUBMISSION_MODES: Array<{ value: string; label: string }> = [
  { value: "text_only", label: "Text answer" },
  { value: "link_only", label: "Link to work" },
  { value: "text_and_link", label: "Both" },
];

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: "writing", label: "Writing" },
  { value: "deck", label: "Pitch deck" },
  { value: "code", label: "Code" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "strategy", label: "Strategy" },
  { value: "design", label: "Design" },
];

const DIMS: Array<{ key: "strategy" | "execution" | "communication" | "technical" | "creativity"; label: string }> = [
  { key: "strategy", label: "Strategy" },
  { key: "execution", label: "Execution" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
  { key: "creativity", label: "Creativity" },
];

const MAX_FILES = 5;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

type PickedFile = {
  file: File;
  id: string;
};

type UploadedAttachment = {
  filename: string;
  url: string;
  size: number;
  content_type: string;
  storage_path: string;
};

export function CreateTaskForm({ companyId }: { companyId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTask, initial);
  const [redirecting, setRedirecting] = useState(false);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [submissionMode, setSubmissionMode] = useState("link_only");
  const [category, setCategory] = useState("strategy");
  const [showWeights, setShowWeights] = useState(false);
  const [showReviewer, setShowReviewer] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<"ai" | "human">("ai");
  const [weights, setWeights] = useState({
    strategy: 20,
    execution: 20,
    communication: 20,
    technical: 20,
    creativity: 20,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const weightsTotal =
    weights.strategy +
    weights.execution +
    weights.communication +
    weights.technical +
    weights.creativity;

  // Reset the upload spinner on mount AND whenever the browser
  // restores the page from BFCache (back-button after a successful
  // redirect). Without this, the button stays "Uploading…" forever
  // because React state was frozen mid-upload before the redirect.
  useEffect(() => {
    setUploading(false);
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setUploading(false);
        setUploadError(null);
        setRedirecting(false);
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Navigate after the action returns success. Doing this client-side
  // (instead of redirect() inside the server action) avoids a Next 16
  // server-action redirect issue where the destination page rendered
  // with "This page couldn't load" after long actions.
  useEffect(() => {
    if (state.status === "success") {
      setRedirecting(true);
      router.push(`/companies/tasks/${state.taskId}`);
    }
  }, [state, router]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setPickError(null);
    const incoming = Array.from(list);
    const accepted: PickedFile[] = [];
    for (const f of incoming) {
      if (files.length + accepted.length >= MAX_FILES) {
        setPickError(`Max ${MAX_FILES} files per task.`);
        break;
      }
      if (f.size > MAX_FILE_BYTES) {
        setPickError(`${f.name} is over 50 MB — pick a smaller file.`);
        continue;
      }
      accepted.push({ file: f, id: `${Date.now()}-${Math.random()}` });
    }
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending || uploading) return;

    setUploadError(null);

    // Snapshot the form values BEFORE flipping into uploading state.
    // Once `disabled` is set on the inputs, FormData() excludes them
    // (disabled inputs don't submit) — so capturing here keeps title +
    // brief + estimated_time in the payload even if files take time
    // to upload.
    const fd = new FormData(formRef.current!);

    const attachments: UploadedAttachment[] = [];

    if (files.length > 0) {
      setUploading(true);
      const supabase = createBrowserSupabase();
      const taskTempId = crypto.randomUUID();
      try {
        for (const { file } of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
          const path = `${companyId}/${taskTempId}/${safeName}`;
          console.log("[CreateTaskForm] uploading", file.name, file.size);

          // Race the upload against a 60-second timeout. Supabase
          // .upload() occasionally hangs on network blips with no
          // error — without this the button stays "Uploading…" forever.
          const uploadPromise = supabase.storage
            .from("task-attachments")
            .upload(path, file, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Upload timed out after 60s: ${file.name}`)),
              60_000,
            ),
          );
          const { error: upErr } = await Promise.race([
            uploadPromise,
            timeoutPromise,
          ]);
          if (upErr) {
            console.error("[CreateTaskForm] upload error", file.name, upErr);
            throw upErr;
          }
          const { data: pub } = supabase.storage
            .from("task-attachments")
            .getPublicUrl(path);
          console.log("[CreateTaskForm] uploaded", file.name, "→", pub.publicUrl);
          attachments.push({
            filename: file.name,
            url: pub.publicUrl,
            size: file.size,
            content_type: file.type || "application/octet-stream",
            storage_path: path,
          });
        }
      } catch (err) {
        console.error("[CreateTaskForm upload]", err);
        const msg =
          err instanceof Error
            ? err.message
            : "One of the files didn't upload.";
        // Surface the real reason so the user knows what to do next
        // (bucket not found → run migration 027; size → trim; etc.).
        setUploadError(
          `Upload failed: ${msg}. You can remove the file and try again with just text + a link.`,
        );
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    fd.set("attachments_json", JSON.stringify(attachments));
    // Normalize weight inputs to 0–1.
    for (const d of DIMS) {
      fd.set(`weight_${d.key}`, String(weights[d.key] / 100));
    }
    fd.set("submission_mode", submissionMode);
    fd.set("category", category);
    fd.set("evaluation_mode", evaluationMode);

    // Hand off to the server action. From here, the `pending` flag
    // from useActionState drives the button text ("Posting…"). Drop
    // our upload flag explicitly so the button never gets stuck on
    // "Uploading…" if the transition state hiccups.
    setUploading(false);
    formAction(fd);
  }

  const disabled = pending || uploading || redirecting;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-10" noValidate>
      {/* TITLE */}
      <div>
        <label htmlFor="task-title" className={labelCls}>
          Task title <span className="text-oxblood">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          required
          disabled={disabled}
          placeholder="e.g., 'Build a 3-year financial model' or 'Design our landing page'"
          className={inputCls}
        />
      </div>

      {/* FILES */}
      <div>
        <p className={labelCls}>Files</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="
            relative border-[1.5px] border-dashed border-oxblood/50
            bg-parchment/40 hover:bg-parchment/60
            transition-colors duration-200 ease-out
            min-h-[140px] flex flex-col items-center justify-center
            text-center px-6 py-8
          "
        >
          <Upload
            aria-hidden
            size={22}
            strokeWidth={1.6}
            className="text-oxblood/70"
          />
          <p className="mt-3 text-[14px] tracking-[-0.005em] text-ink">
            Drag files here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="text-oxblood underline underline-offset-2 hover:text-oxblood-hover transition-colors duration-200 ease-out"
            >
              click to browse
            </button>
          </p>
          <p className="mt-2 text-[12px] text-muted">
            Briefs, datasets, code, video references, anything. 50 MB per
            file, {MAX_FILES} files max.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
            disabled={disabled}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map(({ file, id }) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 border border-ink/15 bg-cream px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-[13px] tracking-[-0.005em] text-ink truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    {prettySize(file.size)} · {file.type || "unknown type"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  className="text-muted hover:text-oxblood transition-colors duration-200 ease-out disabled:opacity-50"
                >
                  <X size={14} strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {pickError && (
          <p className="mt-2 text-[13px] text-oxblood">{pickError}</p>
        )}
        {uploadError && (
          <p className="mt-2 text-[13px] text-oxblood">{uploadError}</p>
        )}
      </div>

      {/* DESCRIPTION */}
      <div>
        <label htmlFor="task-brief" className={labelCls}>
          Description / instructions
        </label>
        <textarea
          id="task-brief"
          name="brief"
          rows={6}
          disabled={disabled}
          placeholder="Optional — describe what you need, what to focus on, what 'good' looks like. Markdown supported."
          className={`${inputCls} resize-y min-h-[140px]`}
        />
      </div>

      {/* SUBMISSION MODE */}
      <div>
        <p className={labelCls}>
          What format should submissions be? <span className="text-oxblood">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SUBMISSION_MODES.map((m) => (
            <Chip
              key={m.value}
              label={m.label}
              active={submissionMode === m.value}
              onClick={() => setSubmissionMode(m.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* CATEGORY */}
      <div>
        <label htmlFor="task-category" className={labelCls}>
          Category
        </label>
        <select
          id="task-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={disabled}
          className={inputCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ESTIMATED TIME */}
      <div>
        <label htmlFor="task-time" className={labelCls}>
          Estimated time
        </label>
        <input
          id="task-time"
          name="estimated_time"
          type="text"
          disabled={disabled}
          placeholder="e.g., '2-4 hours' or '1 day'"
          className={inputCls}
        />
      </div>

      {/* ADVANCED — WEIGHTS */}
      <div>
        <button
          type="button"
          onClick={() => setShowWeights((v) => !v)}
          className="text-[12px] tracking-[0.04em] uppercase text-oxblood link-anim hover:text-oxblood-hover transition-colors duration-200 ease-out"
        >
          Advanced: tune scoring weights {showWeights ? "↑" : "↓"}
        </button>
        {showWeights && (
          <div className="mt-5 border-l-2 border-oxblood/40 pl-5">
            <p className="text-[13px] leading-[1.55] text-muted mb-4 max-w-[58ch]">
              These weights determine how scores across the 5 dimensions
              combine into the total. Leave defaults unless you want to
              emphasize specific skills.
            </p>
            <div className="space-y-4">
              {DIMS.map((d) => (
                <div key={d.key}>
                  <div className="flex items-baseline justify-between mb-1">
                    <label className="text-[14px] text-ink">{d.label}</label>
                    <span className="font-display text-[16px] text-oxblood tabular-nums">
                      {weights[d.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={weights[d.key]}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [d.key]: Number(e.target.value),
                      }))
                    }
                    disabled={disabled}
                    className="w-full accent-oxblood"
                  />
                </div>
              ))}
            </div>
            <p
              className={`mt-3 text-[12px] tabular-nums ${
                weightsTotal === 100 ? "text-muted" : "text-oxblood"
              }`}
            >
              Total: {weightsTotal}%{" "}
              {weightsTotal !== 100 && "(we'll normalize this on submit)"}
            </p>
          </div>
        )}
      </div>

      {/* ADVANCED — REVIEWER */}
      <div>
        <button
          type="button"
          onClick={() => setShowReviewer((v) => !v)}
          className="text-[12px] tracking-[0.04em] uppercase text-oxblood link-anim hover:text-oxblood-hover transition-colors duration-200 ease-out"
        >
          Advanced: reviewer settings {showReviewer ? "↑" : "↓"}
        </button>
        {showReviewer && (
          <div className="mt-5 border-l-2 border-oxblood/40 pl-5 space-y-2.5">
            <Radio
              name="evaluation_mode"
              value="ai"
              label="AI feedback only"
              hint="Anthropic's Claude scores submissions in 30–60 seconds."
              checked={evaluationMode === "ai"}
              onChange={() => setEvaluationMode("ai")}
              disabled={disabled}
            />
            <Radio
              name="evaluation_mode"
              value="human"
              label="AI feedback + human reviewer"
              hint="Same instant AI scoring — plus the RuneShips team gets a heads-up to spot-check submissions."
              checked={evaluationMode === "human"}
              onChange={() => setEvaluationMode("human")}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-[14px] text-oxblood">
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pt-4 border-t border-ink/10">
        <button
          type="submit"
          disabled={disabled}
          aria-busy={disabled}
          className={`
            inline-flex items-center
            min-h-[52px] px-7
            bg-oxblood text-cream border border-oxblood
            text-[14px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            ${disabled ? "btn-pulse" : ""}
          `}
        >
          {uploading
            ? "Uploading…"
            : pending
            ? "Posting…"
            : redirecting
            ? "Opening task…"
            : "Post task"}
        </button>
        <Link
          href="/companies/dashboard"
          className="link-anim text-[13px] tracking-[0.005em] text-muted hover:text-ink transition-colors duration-200 ease-out"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

const labelCls =
  "block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5";
const inputCls = `
  w-full min-h-[52px] px-4 py-2.5
  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
  text-[15px] tracking-[-0.005em] leading-[1.5]
  outline-none
  transition-colors duration-150 ease-out
  focus:border-oxblood focus:ring-1 focus:ring-oxblood
  disabled:opacity-60 disabled:cursor-not-allowed
`;

function Chip({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`
        inline-flex items-center min-h-[40px] px-4
        border text-[13px] tracking-[-0.005em]
        transition-colors duration-150 ease-out
        disabled:cursor-not-allowed
        ${active
          ? "bg-oxblood text-cream border-oxblood"
          : "bg-cream text-ink/85 border-ink/25 hover:border-ink/50"
        }
      `}
    >
      {label}
    </button>
  );
}

function Radio({
  name,
  value,
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  name: string;
  value: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 accent-oxblood"
      />
      <span>
        <span className="block text-[14px] tracking-[-0.005em] text-ink">
          {label}
        </span>
        <span className="block mt-1 text-[12px] leading-[1.5] text-muted">
          {hint}
        </span>
      </span>
    </label>
  );
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
