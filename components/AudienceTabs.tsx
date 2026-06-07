"use client";

import { useState, useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import Link from "next/link";
import { CompanyDialog } from "./CompanyDialog";

type Tab = "students" | "companies";

const STUDENT_POINTS = [
  "Get real feedback before your first internship",
  "Build a skill rank by category",
  "Share verified task credentials on LinkedIn",
  "Prove ability without needing connections",
] as const;

const COMPANY_POINTS = [
  "Post pilot tasks for free",
  "Reach motivated early-career talent",
  "See how students frame ambiguous problems",
  "Recruit from ranked, work-tested candidates",
] as const;

/**
 * Two-tab section: students vs. companies. Active tab indicated by an
 * oxblood underline. Panels crossfade at 200ms when switched.
 *
 * Listens for the URL hash so navigating to /#students or /#companies
 * from the sticky nav also flips the tab state.
 */
export function AudienceTabs() {
  const [active, setActive] = useState<Tab>("students");
  const reducedMotion = useReducedMotion();
  const fadeDuration = reducedMotion ? 0 : 0.2;

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash;
      if (hash === "#companies") setActive("companies");
      else if (hash === "#students") setActive("students");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Audience"
        className="flex gap-8 sm:gap-12 border-b border-rule"
      >
        <TabTrigger
          id="tab-students"
          panelId="panel-students"
          label="For students"
          active={active === "students"}
          onClick={() => setActive("students")}
        />
        <TabTrigger
          id="tab-companies"
          panelId="panel-companies"
          label="For companies"
          active={active === "companies"}
          onClick={() => setActive("companies")}
        />
      </div>

      <div className="mt-12 sm:mt-14 relative">
        <AnimatePresence mode="wait" initial={false}>
          {active === "students" ? (
            <motion.div
              key="students"
              id="panel-students"
              role="tabpanel"
              aria-labelledby="tab-students"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: fadeDuration,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <DashedList items={STUDENT_POINTS} />
              <div className="mt-10">
                <Link
                  href="#waitlist"
                  className="
                    inline-flex items-center
                    min-h-[52px] px-7
                    bg-oxblood text-cream
                    border border-oxblood
                    text-[15px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
                  "
                >
                  Get early access
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="companies"
              id="panel-companies"
              role="tabpanel"
              aria-labelledby="tab-companies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: fadeDuration,
                ease: [0.22, 0.61, 0.36, 1],
              }}
            >
              <DashedList items={COMPANY_POINTS} />
              <div className="mt-10">
                <CompanyDialog />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabTrigger({
  id,
  panelId,
  label,
  active,
  onClick,
}: {
  id: string;
  panelId: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      className={`
        relative pb-4 -mb-px
        font-display text-[26px] sm:text-[32px] leading-[1.1] tracking-[-0.014em]
        transition-colors duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink
        ${active ? "text-ink" : "text-muted hover:text-ink"}
      `}
    >
      {label}
      {active && (
        <motion.span
          layoutId="audience-underline"
          aria-hidden
          className="absolute left-0 right-0 -bottom-px h-[2px] bg-oxblood"
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        />
      )}
    </button>
  );
}

function DashedList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 max-w-[60ch]">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[16px] sm:text-[17px] leading-[1.55] text-ink/85"
        >
          <span aria-hidden className="text-oxblood pt-[2px]">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
