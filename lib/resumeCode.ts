/**
 * Generate an 8-character alphanumeric resume verification code.
 * Avoids visually ambiguous chars (0/O, 1/I/l) so a recruiter can
 * type the code off a printout without second-guessing.
 *
 * 31^8 ≈ 8.5e11 possible codes — collision-free at any realistic
 * RuneShips scale. The DB still enforces uniqueness via the
 * `profiles.resume_code` unique constraint; the caller retries on
 * collision.
 */
const CHARS = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateResumeCode(): string {
  let out = "";
  // crypto.getRandomValues for cryptographic-quality randomness.
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 8; i++) {
    out += CHARS[buf[i] % CHARS.length];
  }
  return out;
}

/** Resume cooldown — once per ISO week, in milliseconds. */
export const RESUME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Returns ISO-string of the next moment a new resume can be generated. */
export function nextResumeAvailableAt(lastResumeAt: string): string {
  return new Date(
    new Date(lastResumeAt).getTime() + RESUME_COOLDOWN_MS,
  ).toISOString();
}

/** True if the user is still in cooldown given their last_resume_at. */
export function isInResumeCooldown(lastResumeAt: string | null): boolean {
  if (!lastResumeAt) return false;
  return (
    Date.now() - new Date(lastResumeAt).getTime() < RESUME_COOLDOWN_MS
  );
}

/** Days remaining until they can regenerate (rounded up). 0 if ready. */
export function daysUntilNextResume(lastResumeAt: string | null): number {
  if (!lastResumeAt) return 0;
  const elapsed = Date.now() - new Date(lastResumeAt).getTime();
  const remaining = RESUME_COOLDOWN_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (24 * 60 * 60 * 1000));
}
