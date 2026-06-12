import type { SubmissionMode } from "./database.types";

/** Human label for the three submission modes a task can require. */
export function submissionModeLabel(mode: SubmissionMode): string {
  switch (mode) {
    case "text_only":
      return "Text only";
    case "link_only":
      return "Link only";
    case "text_and_link":
      return "Text + link";
  }
}

/**
 * The five skill dimensions a task tests heaviest, derived from the
 * per-dimension weights. Anything ≥ 0.20 is considered a primary axis
 * for tag display on the task list and detail header.
 */
export function testedDimensions(task: {
  weight_strategy: number;
  weight_execution: number;
  weight_communication: number;
  weight_technical: number;
  weight_creativity: number;
}): string[] {
  const dims: Array<readonly [string, number]> = [
    ["Strategy", task.weight_strategy],
    ["Execution", task.weight_execution],
    ["Communication", task.weight_communication],
    ["Technical", task.weight_technical],
    ["Creativity", task.weight_creativity],
  ];
  return dims.filter(([, w]) => w >= 0.2).map(([name]) => name);
}

/** Coarse relative-time formatter. Designed for short list-row labels. */
export function timeAgo(input: string | Date): string {
  const ts =
    typeof input === "string" ? new Date(input).getTime() : input.getTime();
  if (Number.isNaN(ts)) return "";

  const ms = Date.now() - ts;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Human description of when the user's 24-hour cooldown lifts.
 * Examples: "tomorrow at 2:14 PM", "today at 9:30 AM", "Friday at 11:05 AM".
 */
export function formatNextAllowed(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "tomorrow";

  const now = new Date();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

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
  if (dayDiff < 7)
    return `${date.toLocaleDateString("en-US", { weekday: "long" })} at ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${time}`;
}

/** Show only the host for a supporting link in display contexts. */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** 24h in ms — used by cooldown checks on both client and server. */
export const COOLDOWN_MS = 24 * 60 * 60 * 1000;
