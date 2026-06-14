/**
 * Convert a free-form name into a URL-safe kebab-case slug. Used
 * when creating new companies + tasks. Caller must check uniqueness
 * (we append `-2`, `-3`, etc. via the helper below when needed).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/**
 * Returns a slug that doesn't collide with `existing`. Append a
 * numeric suffix if the base slug is taken.
 */
export function uniqueSlug(base: string, existing: Set<string>): string {
  if (!existing.has(base) && base.length > 0) return base;
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
