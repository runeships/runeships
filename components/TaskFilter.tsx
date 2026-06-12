"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { TaskCategory } from "@/lib/database.types";
import { CATEGORY_LABELS } from "./TaskCard";

type Filters = {
  category: TaskCategory | null;
  query: string;
};

type TaskFilterProps = {
  onFilterChange: (filters: Filters) => void;
  /**
   * Optional set of categories present in the current task set.
   * If provided, chips with no tasks are still rendered (we keep all
   * six visible for stable layout), but you can swap in `Set` to hide
   * empties later.
   */
  availableCategories?: Set<TaskCategory>;
};

const CHIPS: Array<{ id: TaskCategory | null; label: string }> = [
  { id: null, label: "All" },
  { id: "writing", label: CATEGORY_LABELS.writing },
  { id: "deck", label: CATEGORY_LABELS.deck },
  { id: "code", label: CATEGORY_LABELS.code },
  { id: "spreadsheet", label: CATEGORY_LABELS.spreadsheet },
  { id: "strategy", label: CATEGORY_LABELS.strategy },
  { id: "design", label: CATEGORY_LABELS.design },
];

/**
 * Search + category chips. Debounces the search input by 200ms so
 * we don't filter on every keystroke. Single-active chip behavior —
 * clicking an active chip clears it back to "All".
 */
export function TaskFilter({
  onFilterChange,
  availableCategories,
}: TaskFilterProps) {
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [query, setQuery] = useState("");

  // Debounce query changes — emit category changes immediately.
  useEffect(() => {
    const t = window.setTimeout(() => {
      onFilterChange({ category, query: query.trim() });
    }, 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  function toggleCategory(next: TaskCategory | null) {
    setCategory((prev) => {
      // Clicking the active chip clears it.
      if (next !== null && prev === next) return null;
      return next;
    });
  }

  return (
    <div>
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.5}
          aria-hidden
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/45 pointer-events-none"
        />
        <input
          type="search"
          inputMode="search"
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tasks"
          className="
            w-full min-h-[44px] pl-10 pr-4
            border border-ink/15 bg-cream text-ink placeholder:text-ink/40
            text-[14px] tracking-[-0.005em]
            rounded-[2px]
            outline-none
            transition-colors duration-200 ease-out
            focus:border-ink/40
          "
        />
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const active =
            chip.id === null ? category === null : category === chip.id;
          const disabled =
            chip.id !== null &&
            availableCategories !== undefined &&
            !availableCategories.has(chip.id);

          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => toggleCategory(chip.id)}
              disabled={disabled}
              className={`
                inline-flex items-center
                px-3.5 py-1.5
                text-[13px] tracking-[0.005em]
                rounded-[2px] border
                transition-colors duration-200 ease-out
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  active
                    ? "bg-oxblood text-cream border-oxblood"
                    : "bg-cream text-ink/80 border-ink/15 hover:bg-parchment hover:text-ink"
                }
              `}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { Filters };
