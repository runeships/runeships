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
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  for (let i = 0; i < 8; i++) {
    out += CHARS[buf[i] % CHARS.length];
  }
  return out;
}

/** Daily cooldown for /cv-builder regeneration. Each build can fan
 *  out to an Anthropic call for uncached task summaries — gate at
 *  24h to keep the per-user cost bounded. */
export const CV_BUILD_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function isInCvBuildCooldown(lastResumeAt: string | null): boolean {
  if (!lastResumeAt) return false;
  return Date.now() - new Date(lastResumeAt).getTime() < CV_BUILD_COOLDOWN_MS;
}

export function nextCvBuildAvailableAt(lastResumeAt: string): string {
  return new Date(
    new Date(lastResumeAt).getTime() + CV_BUILD_COOLDOWN_MS,
  ).toISOString();
}

/** Hours remaining until the user can regenerate (rounded up).
 *  Returns 0 if ready. */
export function hoursUntilNextCvBuild(lastResumeAt: string | null): number {
  if (!lastResumeAt) return 0;
  const elapsed = Date.now() - new Date(lastResumeAt).getTime();
  const remaining = CV_BUILD_COOLDOWN_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / (60 * 60 * 1000));
}
