"use client";

import { useState, useTransition } from "react";
import { updateCompanyNotifications } from "@/app/actions/updateCompanyNotifications";

/**
 * Single switch that toggles whether this company account receives
 * the "new submission released" email. Optimistic update with a
 * rollback + toast on failure, mirroring the student AccountTab
 * pattern.
 */
export function CompanyNotificationsToggle({
  initialNotifyOnNewSubmission,
}: {
  initialNotifyOnNewSubmission: boolean;
}) {
  const [enabled, setEnabled] = useState(initialNotifyOnNewSubmission);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await updateCompanyNotifications({
        notifyOnNewSubmission: next,
      });
      if (!result.success) {
        setEnabled(!next);
        window.dispatchEvent(
          new CustomEvent("runeships:toast", {
            detail: { text: "Couldn’t save preference. Try again." },
          }),
        );
      }
    });
  }

  return (
    <label className="flex items-start gap-3 cursor-pointer select-none max-w-[60ch]">
      <input
        type="checkbox"
        checked={enabled}
        onChange={toggle}
        disabled={pending}
        className="mt-1 accent-oxblood shrink-0"
      />
      <span>
        <span className="block text-[14px] tracking-[-0.005em] text-ink font-medium">
          Email me when a submission is released
        </span>
        <span className="block mt-1 text-[12px] leading-[1.55] text-muted">
          {enabled
            ? "On. You’ll get a short email with the student name and overall score."
            : "Off. No release emails will reach this account."}
        </span>
      </span>
    </label>
  );
}
