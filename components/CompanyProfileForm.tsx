"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateCompany,
  type UpdateCompanyState,
} from "@/app/actions/updateCompany";

const initial: UpdateCompanyState = { status: "idle" };

const SIZE_BANDS = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;
const CATEGORIES = [
  "Writing",
  "Pitch deck",
  "Code",
  "Spreadsheet",
  "Strategy",
  "Design",
] as const;

export type CompanyProfileInitial = {
  name: string;
  industry: string;
  sizeBand: string;
  website: string;
  description: string;
  taskCategories: string[];
};

export function CompanyProfileForm({
  initialValues,
}: {
  initialValues: CompanyProfileInitial;
}) {
  const [state, formAction, pending] = useActionState(updateCompany, initial);
  const [sizeBand, setSizeBand] = useState<string>(initialValues.sizeBand);
  const [categories, setCategories] = useState<string[]>(
    initialValues.taskCategories,
  );
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (state.status === "saved") {
      setSavedFlash(true);
      const t = window.setTimeout(() => setSavedFlash(false), 3000);
      return () => window.clearTimeout(t);
    }
  }, [state]);

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
          defaultValue={initialValues.name}
          disabled={pending}
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
          defaultValue={initialValues.industry}
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
          defaultValue={initialValues.website}
          disabled={pending}
          placeholder="yourcompany.com"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="company-description">
          About the company
        </label>
        <textarea
          id="company-description"
          name="description"
          rows={4}
          defaultValue={initialValues.description}
          disabled={pending}
          placeholder="One or two sentences students see on your task pages."
          className={`${inputCls} resize-y min-h-[100px]`}
        />
      </div>

      <div>
        <p className={labelCls}>Types of tasks you typically post</p>
        <p className="mt-1 text-[12px] text-muted mb-3">
          Used for notifications and analytics. Update anytime as your
          hiring focus shifts.
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

      <div className="pt-6 border-t border-ink/10 flex items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className={`
            inline-flex items-center
            min-h-[48px] px-7
            bg-oxblood text-cream border border-oxblood
            text-[14px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover
            disabled:opacity-60 disabled:cursor-not-allowed
            ${pending ? "btn-pulse" : ""}
          `}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {savedFlash && (
          <p
            role="status"
            className="text-[13px] tracking-[0.005em] text-oxblood"
          >
            Saved.
          </p>
        )}
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
