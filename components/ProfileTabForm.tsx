"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/app/actions/updateProfile";
import { RadarChart, type RadarValues } from "@/components/RadarChart";

const CAREER_TRACKS = [
  "Finance",
  "Consulting",
  "Product management",
  "Software engineering",
  "Strategy",
  "Marketing",
  "Data science",
  "Design (UI/UX)",
  "Operations",
  "Entrepreneurship",
] as const;

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030] as const;

const SKILL_LABELS: Array<{
  key: keyof RadarValues;
  name: string;
  detail: string;
}> = [
  { key: "strategy", name: "Strategy", detail: "analytical thinking, problem framing" },
  { key: "execution", name: "Execution", detail: "quality, completeness, attention to detail" },
  { key: "communication", name: "Communication", detail: "clarity, structure, writing & presentation" },
  { key: "technical", name: "Technical", detail: "appropriate use of tools, code, data" },
  { key: "creativity", name: "Creativity", detail: "original insight, novel framing" },
];

const initial: UpdateProfileState = { status: "idle" };

export type ProfileInitial = {
  fullName: string;
  school: string;
  graduationYear: number | null;
  careerTracks: string[];
  specificSkills: string[];
  selfRated: RadarValues;
};

/**
 * Profile tab editor — name, school, grad year, career-track chips,
 * specific-skills chip list, and the five self-rated sliders with
 * a live radar preview. Submits via the updateProfile server action,
 * fires a runeships:toast on success.
 */
export function ProfileTabForm({ initialValues }: { initialValues: ProfileInitial }) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  const [fullName, setFullName] = useState(initialValues.fullName);
  const [school, setSchool] = useState(initialValues.school);
  const [gradYear, setGradYear] = useState<string>(
    initialValues.graduationYear ? String(initialValues.graduationYear) : "",
  );
  const [tracks, setTracks] = useState<string[]>(initialValues.careerTracks);
  const [skills, setSkills] = useState<string[]>(initialValues.specificSkills);
  const [skillDraft, setSkillDraft] = useState("");
  const [values, setValues] = useState<RadarValues>(initialValues.selfRated);

  // Toast on success. We use the existing global Toast listener so the
  // notification surface is consistent with the rest of the app.
  useEffect(() => {
    if (state.status === "success") {
      window.dispatchEvent(
        new CustomEvent("runeships:toast", { detail: { text: "Profile updated" } }),
      );
    }
  }, [state.status]);

  function toggleTrack(t: string) {
    setTracks((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function commitSkillDraft() {
    const tokens = skillDraft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (tokens.length === 0) return;
    setSkills((prev) => {
      const next = [...prev];
      for (const t of tokens) if (!next.includes(t)) next.push(t);
      return next;
    });
    setSkillDraft("");
  }

  function handleSkillKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitSkillDraft();
    } else if (e.key === "Backspace" && skillDraft === "" && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  function updateValue(key: keyof RadarValues, n: number) {
    setValues((prev) => ({ ...prev, [key]: n }));
  }

  return (
    <form action={formAction} noValidate className="space-y-12">
      {/* ─── Identity ────────────────────────────────────────── */}
      <section className="space-y-8 max-w-[680px]">
        <FieldGroup label="Full name" htmlFor="full_name">
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={pending}
            className={inputCls}
          />
        </FieldGroup>

        <FieldGroup label="School" htmlFor="school">
          <input
            id="school"
            name="school"
            type="text"
            required
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            disabled={pending}
            className={inputCls}
          />
        </FieldGroup>

        <FieldGroup label="Graduation year" htmlFor="graduation_year">
          <select
            id="graduation_year"
            name="graduation_year"
            required
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            disabled={pending}
            className={inputCls}
          >
            <option value="" disabled>Pick a year</option>
            {GRAD_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </FieldGroup>
      </section>

      {/* ─── Career tracks ───────────────────────────────────── */}
      <section className="max-w-[680px]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
          Career tracks
        </p>
        <p className="text-[13px] text-muted mb-5">
          What direction are you aiming at? Pick any that fit.
        </p>
        <div className="flex flex-wrap gap-2">
          {CAREER_TRACKS.map((t) => (
            <Chip key={t} active={tracks.includes(t)} onClick={() => toggleTrack(t)} disabled={pending} label={t} />
          ))}
        </div>
        {/* Hidden inputs so FormData captures the selection. */}
        {tracks.map((t) => (
          <input key={t} type="hidden" name="career_tracks" value={t} />
        ))}
      </section>

      {/* ─── Specific skills ─────────────────────────────────── */}
      <section className="max-w-[680px]">
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
          Specific skills
        </p>
        <p className="text-[13px] text-muted mb-5">
          Tools, languages, software. Type a value and press enter or comma
          to add it.
        </p>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[44px]">
          {skills.length === 0 && (
            <span className="text-[13px] text-muted/70 italic py-2">
              No skills added yet.
            </span>
          )}
          {skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink/25 bg-cream text-[13px] tracking-[-0.005em] text-ink"
            >
              {s}
              <button
                type="button"
                onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                disabled={pending}
                aria-label={`Remove ${s}`}
                className="text-muted hover:text-oxblood transition-colors duration-200 ease-out disabled:cursor-not-allowed"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          value={skillDraft}
          onChange={(e) => setSkillDraft(e.target.value)}
          onKeyDown={handleSkillKey}
          onBlur={commitSkillDraft}
          disabled={pending}
          placeholder="e.g., Python, Figma, Financial modeling"
          className={inputCls}
        />
        {skills.map((s) => (
          <input key={s} type="hidden" name="specific_skills" value={s} />
        ))}
      </section>

      {/* ─── Self-rated sliders + radar ──────────────────────── */}
      <section>
        <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-3">
          Self-rated skills
        </p>
        <p className="text-[13px] leading-[1.55] text-muted max-w-[60ch] mb-8">
          Your self-rated skills are your initial baseline. They appear as a
          dashed polygon on your dashboard radar alongside your earned scores.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
          <div className="space-y-7 max-w-[640px]">
            {SKILL_LABELS.map((s) => (
              <SkillSlider
                key={s.key}
                name={`skill_${s.key}`}
                label={s.name}
                detail={s.detail}
                value={values[s.key]}
                onChange={(e) => updateValue(s.key, Number(e.target.value))}
                disabled={pending}
              />
            ))}
          </div>

          <div className="flex justify-center lg:justify-start">
            <div className="border border-ink/15 bg-cream px-10 py-7 sm:px-12 sm:py-8">
              <RadarChart values={values} size={300} />
            </div>
          </div>
        </div>
      </section>

      {state.status === "error" && (
        <p role="alert" className="text-[14px] leading-snug text-oxblood max-w-[58ch]">
          {state.message}
        </p>
      )}

      <div className="pt-4 border-t border-ink/10">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={`
            inline-flex items-center
            min-h-[56px] px-9
            bg-oxblood text-cream border border-oxblood
            text-[15px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
            disabled:opacity-50 disabled:cursor-not-allowed
            ${pending ? "btn-pulse" : ""}
          `}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

const inputCls = `
  w-full min-h-[52px] px-4
  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
  text-[15px] tracking-[-0.005em]
  outline-none
  transition-colors duration-150 ease-out
  focus:border-oxblood focus:ring-1 focus:ring-oxblood
  disabled:opacity-60 disabled:cursor-not-allowed
`;

function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

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
        inline-flex items-center
        min-h-[40px] px-4
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

function SkillSlider({
  name,
  label,
  detail,
  value,
  onChange,
  disabled,
}: {
  name: string;
  label: string;
  detail: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[14px] tracking-[-0.005em]">
          <span className="text-ink font-medium">{label}</span>
          <span className="text-muted text-[12px]">— {detail}</span>
        </label>
        <span className="font-display text-[20px] leading-none text-ink tabular-nums">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        name={name}
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          w-full h-2 cursor-pointer accent-oxblood
          disabled:opacity-60 disabled:cursor-not-allowed
          focus-visible:outline-none
        "
        style={{ accentColor: "var(--color-oxblood)" }}
      />
    </div>
  );
}
