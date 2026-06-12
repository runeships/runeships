"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { TaskCard } from "./TaskCard";
import { TaskFilter, type Filters } from "./TaskFilter";
import { submissionModeLabel, testedDimensions } from "@/lib/format";
import type {
  SubmissionMode,
  TaskCategory,
} from "@/lib/database.types";

/**
 * Client wrapper for the dashboard "Available tasks" section. Holds the
 * filter state, runs client-side filtering, and renders the responsive
 * card grid with light reorder animations.
 *
 * TODO: client-side filtering works cleanly for ~tens of tasks. Once
 * the task count climbs past ~50, switch to URL-param-based server
 * filtering (e.g. /dashboard?category=code&q=python) for shareable
 * filtered URLs and reduced JS payload.
 */

export type TaskForGrid = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  submission_mode: SubmissionMode;
  estimated_time: string | null;
  category: TaskCategory;
  weight_strategy: number;
  weight_execution: number;
  weight_communication: number;
  weight_technical: number;
  weight_creativity: number;
  company: {
    slug: string;
    name: string;
    is_practice: boolean;
  } | null;
};

type TaskGridProps = {
  tasks: TaskForGrid[];
};

export function TaskGrid({ tasks }: TaskGridProps) {
  const [filters, setFilters] = useState<Filters>({
    category: null,
    query: "",
  });
  const reducedMotion = useReducedMotion();

  const availableCategories = useMemo(() => {
    return new Set(tasks.map((t) => t.category));
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filters.category && t.category !== filters.category) return false;
      if (q) {
        const haystack = `${t.title} ${t.brief}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const showEmptyState = filtered.length === 0;

  function clearFilters() {
    setFilters({ category: null, query: "" });
  }

  const fadeDuration = reducedMotion ? 0 : 0.18;

  return (
    <div>
      <TaskFilter
        onFilterChange={setFilters}
        availableCategories={availableCategories}
      />

      <div className="mt-7">
        {showEmptyState ? (
          <div className="flex flex-col items-center text-center py-12">
            <p className="text-[15px] leading-[1.55] text-muted">
              No tasks match your filters.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="
                mt-4 link-anim text-[13px] tracking-[0.005em] text-ink
                hover:text-oxblood transition-colors duration-200 ease-out
              "
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((t) => {
                const dims = testedDimensions(t);
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{
                      duration: fadeDuration,
                      ease: [0.22, 0.61, 0.36, 1],
                    }}
                    className="h-full"
                  >
                    <TaskCard
                      companySlug={t.company?.slug ?? ""}
                      companyName={t.company?.name ?? ""}
                      isPractice={t.company?.is_practice ?? false}
                      taskSlug={t.slug}
                      title={t.title}
                      category={t.category}
                      submissionMode={submissionModeLabel(t.submission_mode)}
                      estimatedTime={t.estimated_time}
                      topDimensions={dims}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
