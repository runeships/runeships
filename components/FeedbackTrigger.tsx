"use client";

import { useState } from "react";
import { FeedbackModal } from "./FeedbackModal";

type FeedbackTriggerProps = {
  /** 'inline' and 'subtle' render identically for now — kept as a
   *  prop so future variants can diverge without changing callers. */
  variant?: "inline" | "subtle";
  label?: string;
};

/**
 * Small inline link that opens the FeedbackModal. Manages its own
 * open/closed state so callers just drop it in alongside other text.
 */
export function FeedbackTrigger({
  variant: _variant = "subtle",
  label = "Send feedback →",
}: FeedbackTriggerProps) {
  void _variant; // reserved for future variant-specific styling
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          link-anim
          inline text-[inherit] text-oxblood
          hover:text-oxblood-hover
          transition-colors duration-200 ease-out
          focus-visible:outline-none focus-visible:text-oxblood-hover
        "
      >
        {label}
      </button>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
