"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";

/** Student-only StickyNav link to the CV builder.
 *  No state, no popover — the heavy lifting (selection, AI
 *  summaries, preview, copy) lives on /cv-builder. */
export function ConvertToResumeButton() {
  const pathname = usePathname();
  const active = pathname === "/cv-builder";
  return (
    <Link
      href="/cv-builder"
      aria-current={active ? "page" : undefined}
      className={`
        inline-flex items-center gap-1.5 min-h-[32px] px-3
        bg-oxblood text-cream border border-oxblood
        text-[11px] tracking-[0.04em] font-medium
        transition-colors duration-200 ease-out
        hover:bg-oxblood-hover
        ${active ? "opacity-90" : ""}
      `}
    >
      <FileText size={11} strokeWidth={1.8} aria-hidden />
      Build CV bullet
    </Link>
  );
}
