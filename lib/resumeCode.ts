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
