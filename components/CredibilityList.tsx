const CRITERIA = [
  "Submissions evaluated against task-specific rubrics.",
  "AI flags weak reasoning, missing requirements, and generic answers.",
  "Human review calibrates top submissions.",
  "Points are skill-specific — not participation trophies.",
  "Bad or incomplete submissions earn zero points.",
  "Rankings build across repeated tasks, not one lucky submission.",
] as const;

/**
 * Numbered credibility list. Editorial numerals in oxblood, body text
 * in ink. Two-column on desktop, single column on mobile.
 */
export function CredibilityList() {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {CRITERIA.map((item, i) => (
        <li
          key={i}
          className="grid grid-cols-[auto_1fr] items-baseline gap-x-5"
        >
          <span
            className="font-display text-[26px] sm:text-[28px] leading-[1] text-oxblood tracking-[-0.01em]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[16px] leading-[1.55] text-ink/85 max-w-[38ch]">
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
}
