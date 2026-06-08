"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type ToastMessage = { id: number; text: string };

/**
 * Bottom-of-screen ephemeral toast. Listens for a `runeships:toast` custom
 * event with `{ detail: { text: string } }` payload. Each toast holds for
 * 3500ms then fades out.
 *
 * Trigger from anywhere via:
 *   window.dispatchEvent(new CustomEvent("runeships:toast", {
 *     detail: { text: "Thanks — we'll be in touch." },
 *   }));
 */
export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ text?: string }>).detail;
      if (!detail?.text) return;
      const id = Date.now() + Math.random();
      setMessages((prev) => [...prev, { id, text: detail.text! }]);
      window.setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }, 3500);
    };
    window.addEventListener("runeships:toast", handler);
    return () => window.removeEventListener("runeships:toast", handler);
  }, []);

  const duration = reducedMotion ? 0 : 0.25;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] pointer-events-none flex flex-col items-center gap-2"
    >
      <AnimatePresence>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration, ease: [0.22, 0.61, 0.36, 1] }}
            className="
              bg-ink text-cream border-t-2 border-oxblood
              px-5 py-3.5
              text-[14px] tracking-[0.005em] leading-[1.4]
              max-w-[min(90vw,420px)]
            "
          >
            {m.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
