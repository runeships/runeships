import Link from "next/link";
import { ClipboardCheck, RefreshCw, ListChecks } from "lucide-react";
import { createAdminClient } from "@/lib/supabase-admin";

type AdminTab = "queue" | "regrades" | "tasks";

/**
 * Shared header across /admin/* routes. Renders the "Admin" kicker,
 * the signed-in email, and tabs to Review queue + Regrade requests
 * with live pending counts.
 *
 * Server component — fetches both counts in parallel via the admin
 * client (one extra round trip per admin page render, acceptable at
 * MVP volume). Caller passes `current` to mark the active tab and
 * the signed-in email for the right-side meta line.
 */
export async function AdminNav({
  current,
  email,
}: {
  current: AdminTab;
  email: string;
}) {
  const admin = createAdminClient();

  // Pending reviews = submissions on human-evaluated tasks with no
  // feedback row yet. Three-step JS filter mirrors /admin/page.tsx
  // — Database.types.Relationships is empty so we don't pay the
  // cost of typed nested selects.
  const [submissionsRes, humanTasksRes, feedbackRes, regradesRes, deletionRes] =
    await Promise.all([
      admin.from("submissions").select("id, task_id"),
      admin
        .from("tasks")
        .select("id")
        .eq("evaluation_mode", "human"),
      admin.from("feedback").select("submission_id"),
      admin
        .from("regrade_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .not("deletion_requested_at", "is", null),
    ]);

  let queueCount = 0;
  if (
    !submissionsRes.error &&
    !humanTasksRes.error &&
    !feedbackRes.error
  ) {
    const humanIds = new Set(
      (humanTasksRes.data ?? []).map((t) => t.id),
    );
    const fbIds = new Set(
      (feedbackRes.data ?? []).map((f) => f.submission_id),
    );
    queueCount = (submissionsRes.data ?? []).filter(
      (s) => humanIds.has(s.task_id) && !fbIds.has(s.id),
    ).length;
  }
  const regradesCount = regradesRes.count ?? 0;
  const deletionCount = deletionRes.count ?? 0;

  return (
    <header className="mt-2">
      <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
        Admin · Signed in as {email}
      </p>

      <nav
        aria-label="Admin sections"
        className="mt-7 sm:mt-8 border-b border-ink/15"
      >
        <ul className="flex flex-wrap gap-x-6 sm:gap-x-8 gap-y-1">
          <Tab
            href="/admin"
            label="Review queue"
            icon={<ClipboardCheck size={14} strokeWidth={1.6} />}
            count={queueCount}
            active={current === "queue"}
          />
          <Tab
            href="/admin/regrades"
            label="Regrade requests"
            icon={<RefreshCw size={14} strokeWidth={1.6} />}
            count={regradesCount}
            active={current === "regrades"}
          />
          <Tab
            href="/admin/tasks"
            label="Tasks"
            icon={<ListChecks size={14} strokeWidth={1.6} />}
            count={deletionCount}
            active={current === "tasks"}
          />
        </ul>
      </nav>
    </header>
  );
}

function Tab({
  href,
  label,
  icon,
  count,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`
          inline-flex items-center gap-2 py-3 -mb-px border-b-2
          text-[14px] tracking-[0.005em]
          transition-colors duration-200 ease-out
          focus-visible:outline-none
          ${active
            ? "text-ink font-medium border-oxblood"
            : "text-muted border-transparent hover:text-ink"
          }
        `}
      >
        <span aria-hidden className={active ? "text-oxblood" : ""}>
          {icon}
        </span>
        {label}
        {count > 0 && (
          <span
            aria-label={`${count} pending`}
            className={`
              inline-flex items-center justify-center
              min-w-[20px] h-5 px-1.5 rounded-full
              text-[10px] tracking-[0.04em] tabular-nums font-medium
              ${active
                ? "bg-oxblood text-cream"
                : "bg-parchment text-oxblood border border-oxblood/30"
              }
            `}
          >
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}
