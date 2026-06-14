"use client";

import { useEffect, useState } from "react";

/** Render an ISO timestamp in the user's local timezone with a
 *  human-friendly relative day ("today at", "tomorrow at", "Friday
 *  at"). Server-side rendering of toLocaleTimeString uses the host's
 *  timezone (UTC on Vercel), which silently mislabels times for any
 *  user not in UTC — this component delays formatting until the
 *  client hydrates so it always uses navigator's locale + timezone.
 *
 *  Renders a server-side fallback of "soon" until hydration; the
 *  swap is intentional and suppressHydrationWarning keeps the React
 *  console clean. */
export function LocalTime({
  iso,
  fallback = "soon",
}: {
  iso: string;
  fallback?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelative(iso));
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label ?? fallback}
    </time>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "tomorrow";

  const now = new Date();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  // Day diff in the *user's* timezone (which is what new Date() does
  // by default on the client). Floor to the start-of-day so a
  // submission at 23:55 today vs 00:05 tomorrow doesn't read as the
  // same day.
  const dateDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const nowDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayDiff = Math.round((dateDay - nowDay) / (24 * 60 * 60 * 1000));

  if (dayDiff <= 0) return `today at ${time}`;
  if (dayDiff === 1) return `tomorrow at ${time}`;
  if (dayDiff < 7) {
    return `${date.toLocaleDateString(undefined, { weekday: "long" })} at ${time}`;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
