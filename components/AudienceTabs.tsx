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
  {
    title: "Get real feedback before your first internship",
    detail:
      "Written, specific, within minutes, not the polite no-thanks of an application portal.",
  },
  {
    title: "Build a skill rank by category",
    detail:
      "Strategy, finance, marketing, product. Each scored independently.",
  },
  {
    title: "Share verified task credentials on LinkedIn",
    detail:
      "Embed a public profile or task badge straight into your career stack.",
  },
  {
    title: "Prove ability without needing connections",
    detail:
      "The work travels with you. No introduction required.",
  },
] as const;

const COMPANY_POINTS = [
  {
    title: "Post pilot tasks for free",
    detail:
      "No platform fee while we're building. Free forever for posting.",
  },
  {
    title: "Reach motivated early-career talent",
    detail:
      "Students who opted in voluntarily, beyond the same five target schools.",
  },
  {
    title: "See how students frame ambiguous problems",
    detail:
      "Read submissions before a single interview is scheduled.",
  },
  {
    title: "Recruit from ranked, work-tested candidates",
    detail:
      "Filter by skill rank, not by résumé proxy.",
  },
] as const;

type Point = { title: string; detail: string };

/**
 * Two-tab section: students vs. companies. Active tab indicated by an
 * oxblood underline. Panels crossfade at 200ms when switched.
 *
 * Hash sync: Next.js Link to `/#companies` uses pushState which does NOT
 * fire `hashchange`, so we additionally intercept anchor clicks at the
 * document level. That catches same-page navigation from the sticky nav,
 * the hero secondary CTA, the closing "Talk to us" link, etc.
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

    // Native hashchange — fires for browser hash changes
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);

    // Anchor click interceptor — catches Next Link clicks that use
    // pushState (which silently skips the hashchange event).
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.endsWith("#companies")) setActive("companies");
      else if (href.endsWith("#students")) setActive("students");
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", onClick);
    };
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
              <NumberedList items={STUDENT_POINTS} />
              <div className="mt-12">
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
              <NumberedList items={COMPANY_POINTS} />
              <div className="mt-12">
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
        ${active ? "text-ink" : "text-muted hover:text-oxblood"}
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

function NumberedList({ items }: { items: readonly Point[] }) {
  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-9 max-w-[80ch]">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-5"
        >
          <span
            className="
              font-display text-[14px] tracking-[0.06em] uppercase text-oxblood
              pt-[3px] tabular-nums
            "
            aria-hidden
          >
            {String(i + 1).padStart(2, "0")}.
          </span>
          <div>
            <p className="text-[16px] sm:text-[17px] leading-[1.4] text-ink/90 font-medium">
              {item.title}.
            </p>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-ink/60">
              {item.detail}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
