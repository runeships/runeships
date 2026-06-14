import Link from "next/link";
import {
  PenTool,
  Presentation,
  Code,
  Table,
  Target,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { TaskCategory } from "@/lib/database.types";

const ICONS: Record<TaskCategory, LucideIcon> = {
  writing: PenTool,
  deck: Presentation,
  code: Code,
  spreadsheet: Table,
  strategy: Target,
  design: Palette,
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  writing: "Writing",
  deck: "Pitch deck",
  code: "Code",
  spreadsheet: "Spreadsheet",
  strategy: "Strategy",
  design: "Design",
};

type TaskCardProps = {
  companySlug: string;
  companyName: string;
  isPractice: boolean;
  taskSlug: string;
  title: string;
  category: TaskCategory;
  submissionMode: string;
  estimatedTime: string | null;
  topDimensions: string[];
};

/**
 * Editorial task card for the dashboard grid. Hairline border, no
 * shadows, restrained 2px radius — explicitly an editorial card per
 * the updated CLAUDE.md app-vs-marketing rule, NOT a SaaS card.
 *
 * Whole card is a Link. Hover swaps cream→parchment, darkens the
 * border, and slides the trailing arrow 4px right.
 */
export function TaskCard({
  companySlug,
  companyName,
  isPractice,
  taskSlug,
  title,
  category,
  submissionMode,
  estimatedTime,
  topDimensions,
}: TaskCardProps) {
  const Icon = ICONS[category];
  const kicker = isPractice ? "PRACTICE" : companyName.toUpperCase();

  return (
    <Link
      href={`/tasks/${companySlug}/${taskSlug}`}
      className={`
        group flex flex-col h-full
        border rounded-[2px]
        p-6
        transition-colors duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
        ${isPractice
          ? "bg-parchment/60 border-oxblood/30 hover:bg-parchment hover:border-oxblood/55"
          : "bg-cream border-ink/15 hover:bg-parchment hover:border-ink/25"
        }
      `}
    >
      {/* Row 1: category icon + label */}
      <div className="flex items-center justify-between">
        <Icon
          className="text-oxblood"
          size={28}
          strokeWidth={1.5}
          aria-hidden
        />
        <span className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      {/* Row 2: company kicker */}
      <p className="mt-7 text-[11px] tracking-[0.16em] uppercase text-ink/60">
        {kicker}
      </p>

      {/* Row 3: task title */}
      <h3
        className="
          mt-2 font-display font-normal text-[18px] leading-[1.25]
          tracking-[-0.012em] text-ink
          line-clamp-2
        "
      >
        {title}
      </h3>

      {/* Row 4: meta line. Pushed to the bottom via mt-auto on the
          following arrow row so cards in a grid keep matching footers. */}
      <p className="mt-5 text-[12px] leading-[1.5] text-ink/55">
        {submissionMode}
        {estimatedTime && (
          <>
            <span aria-hidden className="mx-1.5 text-ink/30">
              ·
            </span>
            {estimatedTime}
          </>
        )}
        {topDimensions.length > 0 && (
          <>
            <span aria-hidden className="mx-1.5 text-ink/30">
              ·
            </span>
            {topDimensions.join(" · ")}
          </>
        )}
      </p>

      {/* Row 5: arrow, pushed to bottom */}
      <div className="mt-auto pt-5 flex justify-end">
        <span
          aria-hidden
          className="
            text-oxblood text-[18px] leading-none
            transition-transform duration-200 ease-out
            group-hover:translate-x-1
          "
        >
          →
        </span>
      </div>
    </Link>
  );
}
