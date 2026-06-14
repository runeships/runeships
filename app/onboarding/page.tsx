"use client";

import {
  useState,
  useTransition,
  useId,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Reveal } from "@/components/Reveal";
import { RuneOpener } from "@/components/RuneOpener";
import { RadarChart, type RadarValues } from "@/components/RadarChart";
import {
  completeOnboarding,
  type OnboardingState,
} from "@/app/actions/completeOnboarding";

/**
 * Career tracks = the high-level industry / role direction the student
 * is aiming at. NOT the same as the five skill dimensions (those live
 * on the radar in section 3).
 */
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

/**
 * Specific skills = tools, languages, and software the student can
 * use. Distinct from career tracks AND from the five skill dimensions.
 */
const SPECIFIC_SKILLS = [
  "Python",
  "JavaScript / TypeScript",
  "SQL",
  "C++",
  "Java",
  "R",
  "Excel",
  "Google Sheets",
  "Financial modeling",
  "Tableau / Power BI",
  "Figma",
  "Adobe Creative Suite",
  "PowerPoint / Keynote",
  "Notion",
  "Statistics",
  "Machine learning",
] as const;

const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029, 2030] as const;

const SKILL_LABELS: Array<{
  key: keyof RadarValues;
  name: string;
  detail: string;
}> = [
  {
    key: "strategy",
    name: "Strategy",
    detail: "analytical thinking, problem framing",
  },
  {
    key: "execution",
    name: "Execution",
    detail: "quality, completeness, attention to detail",
  },
  {
    key: "communication",
    name: "Communication",
    detail: "clarity, structure, writing & presentation",
  },
  {
    key: "technical",
    name: "Technical",
    detail: "tools, code, data, calculations",
  },
  {
    key: "creativity",
    name: "Creativity",
    detail: "original insight, novel framing",
  },
];

export default function OnboardingPage() {
  // ─── Form state ───
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [graduationYear, setGraduationYear] = useState<number | "">("");
  const [tracks, setTracks] = useState<Set<string>>(new Set());
  const [otherTrack, setOtherTrack] = useState("");
  const [tools, setTools] = useState<Set<string>>(new Set());
  const [otherTool, setOtherTool] = useState("");
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [skills, setSkills] = useState<RadarValues>({
    strategy: 50,
    execution: 50,
    communication: 50,
    technical: 50,
    creativity: 50,
  });

  // ─── Submission state ───
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<OnboardingState>({ status: "idle" });

  const fullNameId = useId();
  const schoolId = useId();
  const yearId = useId();
  const otherTrackId = useId();
  const otherToolId = useId();

  function toggleTrack(track: string) {
    setTracks((prev) => {
      const next = new Set(prev);
      if (next.has(track)) next.delete(track);
      else next.add(track);
      return next;
    });
  }

  function toggleTool(tool: string) {
    setTools((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  }

  function updateSkill(key: keyof RadarValues) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setSkills((prev) => ({ ...prev, [key]: v }));
    };
  }

  const canSubmit =
    fullName.trim().length > 0 &&
    school.trim().length > 0 &&
    graduationYear !== "" &&
    (tracks.size > 0 || otherTrack.trim().length > 0) &&
    confirmedAge &&
    !isPending;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await completeOnboarding({ status: "idle" }, formData);
      // If we get here, the action returned (didn't redirect) — that
      // means it produced an error state. Surface it inline.
      setState(result);
    });
  }

  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-40 pb-24 sm:pb-32 min-h-dvh">
      <div className="mx-auto max-w-[1000px]">
        <Reveal mode="load" delay={0.05}>
          <p className="text-[11px] tracking-[0.18em] uppercase text-muted">
            Onboarding
          </p>
          <h1
            className="mt-4 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
            style={{
              fontSize: "clamp(2.4rem, 4.4vw + 1rem, 3.75rem)",
              fontVariationSettings: '"opsz" 144',
            }}
          >
            Welcome to RuneShips.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.55] text-muted max-w-[56ch]">
            A few questions so we know who&rsquo;s behind the work. This takes
            about two minutes — you can update everything later.
          </p>
        </Reveal>

        <Reveal mode="load" delay={0.20} className="mt-14 sm:mt-16">
          <form onSubmit={handleSubmit} noValidate className="space-y-16 sm:space-y-20">

            {/* ─── Section 1: About you ─────────────────────────────── */}
            <section>
              <RuneOpener
                rune="ᛗ"
                name="Mannaz"
                meaning="the individual, who you are"
              />
              <h2
                className="mt-10 sm:mt-12 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center"
                style={{ fontSize: "clamp(1.65rem, 1.6vw + 1rem, 2rem)" }}
              >
                About you.
              </h2>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 max-w-[640px] mx-auto">
                <FieldLabel htmlFor={fullNameId}>Full name</FieldLabel>
                <FieldLabel htmlFor={schoolId}>School</FieldLabel>
                <TextInput
                  id={fullNameId}
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isPending}
                  required
                />
                <div>
                  <TextInput
                    id={schoolId}
                    name="school"
                    type="text"
                    autoComplete="organization"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    disabled={isPending}
                    required
                  />
                  <p className="mt-2 text-[12px] leading-[1.5] text-muted">
                    Write N/A if you&rsquo;re not currently enrolled in
                    education.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel htmlFor={yearId}>Graduation year</FieldLabel>
                  <select
                    id={yearId}
                    name="graduation_year"
                    value={graduationYear}
                    onChange={(e) =>
                      setGraduationYear(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={isPending}
                    required
                    className="
                      w-full sm:w-[260px] min-h-[52px] px-4
                      border border-ink/25 bg-cream text-ink
                      text-[15px] tracking-[-0.005em]
                      outline-none
                      transition-colors duration-150 ease-out
                      focus:border-oxblood focus:ring-1 focus:ring-oxblood
                      disabled:opacity-60
                    "
                  >
                    <option value="">Select a year</option>
                    {GRAD_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ─── Section 2: What you're aiming at ─────────────────── */}
            <section>
              <RuneOpener
                rune="ᚱ"
                name="Raidho"
                meaning="the journey, what you’re aiming at"
              />
              <h2
                className="mt-10 sm:mt-12 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center"
                style={{ fontSize: "clamp(1.65rem, 1.6vw + 1rem, 2rem)" }}
              >
                What you&rsquo;re aiming at.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.55] text-muted max-w-[60ch] mx-auto text-center">
                Pick the tracks you&rsquo;re most interested in and the
                specific tools you&rsquo;re comfortable with. We use both to
                surface relevant tasks and to share your strongest skills
                with recruiters.
              </p>

              <div className="mt-12 max-w-[800px] mx-auto space-y-12">
                {/* Career tracks */}
                <div>
                  <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood mb-5 text-center">
                    Career tracks
                  </p>
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {CAREER_TRACKS.map((track) => (
                      <ChipToggle
                        key={track}
                        label={track}
                        active={tracks.has(track)}
                        onClick={() => toggleTrack(track)}
                        disabled={isPending}
                      />
                    ))}
                  </div>

                  {/* Hidden inputs serialize the active tracks for the action. */}
                  {Array.from(tracks).map((t) => (
                    <input
                      key={t}
                      type="hidden"
                      name="career_tracks"
                      value={t}
                    />
                  ))}

                  <div className="mt-6 max-w-[440px] mx-auto">
                    <FieldLabel htmlFor={otherTrackId}>
                      Other track (optional)
                    </FieldLabel>
                    <TextInput
                      id={otherTrackId}
                      name="other_track"
                      type="text"
                      value={otherTrack}
                      onChange={(e) => setOtherTrack(e.target.value)}
                      disabled={isPending}
                      placeholder="e.g., Climate, Healthcare, Research"
                    />
                  </div>
                </div>

                {/* Specific skills */}
                <div>
                  <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood mb-2.5 text-center">
                    Specific skills
                  </p>
                  <p className="text-[13px] leading-[1.5] text-muted text-center max-w-[52ch] mx-auto mb-5">
                    Tools, languages, and software you can actually use today.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SPECIFIC_SKILLS.map((skill) => (
                      <ChipToggle
                        key={skill}
                        label={skill}
                        active={tools.has(skill)}
                        onClick={() => toggleTool(skill)}
                        disabled={isPending}
                        size="sm"
                      />
                    ))}
                  </div>

                  {/* Hidden inputs serialize the active specific skills. */}
                  {Array.from(tools).map((s) => (
                    <input
                      key={s}
                      type="hidden"
                      name="specific_skills"
                      value={s}
                    />
                  ))}

                  <div className="mt-6 max-w-[440px] mx-auto">
                    <FieldLabel htmlFor={otherToolId}>
                      Other skill (optional)
                    </FieldLabel>
                    <TextInput
                      id={otherToolId}
                      name="other_skill"
                      type="text"
                      value={otherTool}
                      onChange={(e) => setOtherTool(e.target.value)}
                      disabled={isPending}
                      placeholder="e.g., Stata, Solidworks, Mandarin"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Section 3: Where you are now ─────────────────────── */}
            <section>
              <RuneOpener
                rune="ᛟ"
                name="Othala"
                meaning="your starting point, where you stand today"
              />
              <h2
                className="mt-10 sm:mt-12 font-display font-light tracking-[-0.018em] leading-[1.04] text-ink text-center"
                style={{ fontSize: "clamp(1.65rem, 1.6vw + 1rem, 2rem)" }}
              >
                Where you are now.
              </h2>
              <p className="mt-5 text-[15px] leading-[1.55] text-muted max-w-[60ch] mx-auto text-center">
                Rate yourself honestly across these five dimensions. This is
                your starting point — your real scores will build from the
                tasks you complete.
              </p>

              <div className="mt-12 sm:mt-14 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-12 items-start">
                {/* Sliders */}
                <div className="space-y-7 sm:space-y-8">
                  {SKILL_LABELS.map((s) => (
                    <SkillSlider
                      key={s.key}
                      name={`skill_${s.key}`}
                      label={s.name}
                      detail={s.detail}
                      value={skills[s.key]}
                      onChange={updateSkill(s.key)}
                      disabled={isPending}
                    />
                  ))}
                </div>

                {/* Radar chart */}
                <div className="flex flex-col items-center lg:items-stretch">
                  <p className="text-[11px] tracking-[0.20em] uppercase text-muted mb-4 lg:text-left text-center">
                    Your starting profile
                  </p>
                  <div className="border border-ink/15 bg-cream p-7 sm:p-8 flex items-center justify-center">
                    <RadarChart values={skills} size={400} />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Submit ───────────────────────────────────────────── */}
            <section>
              <div className="max-w-[560px] mx-auto mb-8">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedAge}
                    onChange={(e) => setConfirmedAge(e.target.checked)}
                    disabled={isPending}
                    className="mt-1 accent-oxblood shrink-0"
                    aria-describedby="age-confirm-hint"
                  />
                  <span className="text-[14px] leading-[1.55] text-ink">
                    I confirm I am at least 16 years old, and I&rsquo;ve read
                    the{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                <p
                  id="age-confirm-hint"
                  className="mt-2 ml-8 text-[12px] leading-[1.5] text-muted"
                >
                  RuneShips is only available to users aged 16 or older.
                </p>
              </div>

              {state.status === "error" && (
                <p
                  role="alert"
                  className="mb-5 text-[14px] leading-snug text-oxblood text-center"
                >
                  {state.message}
                </p>
              )}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  aria-busy={isPending}
                  className={`
                    inline-flex items-center
                    min-h-[56px] px-9
                    bg-oxblood text-cream
                    border border-oxblood
                    text-[15px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isPending ? "btn-pulse" : ""}
                  `}
                >
                  {isPending ? "Saving…" : "Continue to the tasks →"}
                </button>
              </div>
            </section>

          </form>
        </Reveal>
      </div>
    </main>
  );
}

/* ─── Local form primitives ─────────────────────────────────────────── */

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5"
    >
      {children}
    </label>
  );
}

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

function TextInput(props: TextInputProps) {
  return (
    <input
      {...props}
      className="
        w-full min-h-[52px] px-4
        border border-ink/25 bg-cream text-ink placeholder:text-muted/80
        text-[15px] tracking-[-0.005em]
        outline-none
        transition-colors duration-150 ease-out
        focus:border-oxblood focus:ring-1 focus:ring-oxblood
        disabled:opacity-60
      "
    />
  );
}

type ChipToggleProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: "md" | "sm";
};

function ChipToggle({
  label,
  active,
  onClick,
  disabled,
  size = "md",
}: ChipToggleProps) {
  const sizing =
    size === "sm"
      ? "min-h-[36px] px-3.5 text-[13px]"
      : "min-h-[44px] px-5 text-[14px]";
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center
        ${sizing}
        tracking-[0.005em]
        border
        transition-colors duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
        disabled:opacity-60 disabled:cursor-not-allowed
        ${
          active
            ? "bg-oxblood border-oxblood text-cream hover:bg-oxblood-hover"
            : "bg-cream border-oxblood/40 text-oxblood hover:border-oxblood"
        }
      `}
    >
      {label}
    </button>
  );
}

type SkillSliderProps = {
  name: string;
  label: string;
  detail: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

function SkillSlider({
  name,
  label,
  detail,
  value,
  onChange,
  disabled,
}: SkillSliderProps) {
  const id = useId();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <label
          htmlFor={id}
          className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[14px] tracking-[-0.005em]"
        >
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
          w-full h-2 cursor-pointer
          accent-oxblood
          disabled:opacity-60 disabled:cursor-not-allowed
          focus-visible:outline-none
        "
        style={{ accentColor: "var(--color-oxblood)" }}
      />
    </div>
  );
}
