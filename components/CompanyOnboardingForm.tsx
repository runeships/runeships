"use client";

import { useActionState, useState } from "react";
import {
  createCompany,
  type CreateCompanyState,
} from "@/app/actions/createCompany";

const initial: CreateCompanyState = { status: "idle" };

const SIZE_BANDS = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
const CATEGORIES = [
  "Writing",
  "Pitch deck",
  "Code",
  "Spreadsheet",
  "Strategy",
  "Design",
] as const;

export function CompanyOnboardingForm() {
  const [state, formAction, pending] = useActionState(createCompany, initial);
  const [sizeBand, setSizeBand] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  function toggleCategory(c: string) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label className={labelCls} htmlFor="company-name">
          Company name <span className="text-oxblood">*</span>
        </label>
        <input
          id="company-name"
          name="name"
          type="text"
          required
          disabled={pending}
          placeholder="Veganuño"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="company-industry">
          Industry
        </label>
        <input
          id="company-industry"
          name="industry"
          type="text"
          disabled={pending}
          placeholder="e.g., SaaS, Real estate, E-commerce"
          className={inputCls}
        />
      </div>

      <div>
        <p className={labelCls}>Company size</p>
        <div className="flex flex-wrap gap-2">
          {SIZE_BANDS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={sizeBand === s}
              onClick={() => setSizeBand(sizeBand === s ? "" : s)}
              disabled={pending}
            />
          ))}
        </div>
        {sizeBand && (
          <input type="hidden" name="size_band" value={sizeBand} />
        )}
      </div>

      <div>
        <label className={labelCls} htmlFor="company-website">
          Website
        </label>
        <input
          id="company-website"
          name="website"
          type="text"
          disabled={pending}
          placeholder="yourcompany.com"
          className={inputCls}
        />
      </div>

      <div>
        <p className={labelCls}>Types of tasks you typically post</p>
        <p className="mt-1 text-[12px] text-muted mb-3">
          We&rsquo;ll use this later to match notifications and analytics.
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={categories.includes(c)}
              onClick={() => toggleCategory(c)}
              disabled={pending}
            />
          ))}
        </div>
        {categories.map((c) => (
          <input key={c} type="hidden" name="task_categories" value={c} />
        ))}
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-[14px] text-oxblood">
          {state.message}
        </p>
      )}

      <div className="pt-4 border-t border-ink/10">
        <button
          type="submit"
          disabled={pending}
          className={`
            inline-flex items-center
            min-h-[56px] px-9
            bg-oxblood text-cream border border-oxblood
            text-[15px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover
            disabled:opacity-50 disabled:cursor-not-allowed
            ${pending ? "btn-pulse" : ""}
          `}
        >
          {pending ? "Setting up…" : "Get started"}
        </button>
      </div>
    </form>
  );
}

const labelCls =
  "block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5";
const inputCls = `
  w-full min-h-[52px] px-4
  border border-ink/25 bg-cream text-ink placeholder:text-muted/80
  text-[15px] tracking-[-0.005em]
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
