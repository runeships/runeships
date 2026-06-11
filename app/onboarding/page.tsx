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

const TRACK_OPTIONS = [
  "Strategy",
  "Execution",
  "Communication",
  "Technical",
  "Creativity",
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
  const otherId = useId();

  function toggleTrack(track: string) {
    setTracks((prev) => {
      const next = new Set(prev);
      if (next.has(track)) next.delete(track);
      else next.add(track);
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
      <div className="mx-auto max-w-[860px]">
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
              <p className="mt-5 text-[15px] leading-[1.55] text-muted max-w-[58ch] mx-auto text-center">
                Pick the tracks you&rsquo;re most interested in. We use this to
                surface relevant tasks and to share your strongest skills with
                recruiters.
              </p>

              <div className="mt-10 max-w-[640px] mx-auto">
                <div className="flex flex-wrap gap-2.5 justify-center">
                  {TRACK_OPTIONS.map((track) => {
                    const active = tracks.has(track);
                    return (
                      <button
                        key={track}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleTrack(track)}
                        disabled={isPending}
                        className={`
                          inline-flex items-center
                          min-h-[44px] px-5
                          text-[14px] tracking-[0.005em]
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
                        {track}
                      </button>
                    );
                  })}
                </div>

                {/* Hidden inputs serialize the active tracks for the action. */}
                {Array.from(tracks).map((t) => (
                  <input key={t} type="hidden" name="career_tracks" value={t} />
                ))}

                <div className="mt-7 max-w-[440px] mx-auto">
                  <FieldLabel htmlFor={otherId}>
                    Other (optional)
                  </FieldLabel>
                  <TextInput
                    id={otherId}
                    name="other_track"
                    type="text"
                    value={otherTrack}
                    onChange={(e) => setOtherTrack(e.target.value)}
                    disabled={isPending}
                    placeholder="e.g., Product design, Research"
                  />
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
              <p className="mt-5 text-[15px] leading-[1.55] text-muted max-w-[58ch] mx-auto text-center">
                Rate yourself honestly across these five dimensions. This is
                your starting point — your real scores will build from the
                tasks you complete.
              </p>

              <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">
                {/* Sliders */}
                <div className="space-y-6">
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
                <div className="flex flex-col items-center lg:items-start">
                  <p className="text-[11px] tracking-[0.18em] uppercase text-muted mb-4">
                    Your starting profile
                  </p>
                  <div className="border border-ink/15 bg-cream p-5">
                    <RadarChart values={skills} size={290} />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Submit ───────────────────────────────────────────── */}
            <section>
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
          className="flex items-baseline gap-2 text-[14px] tracking-[-0.005em]"
        >
          <span className="text-ink font-medium">{label}</span>
          <span className="text-muted text-[12px]">— {detail}</span>
        </label>
        <span className="font-display text-[18px] leading-none text-ink tabular-nums">
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
