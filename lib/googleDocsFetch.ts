/**
 * Fetch the contents of a publicly-shared Google Doc / Sheet / Slides
 * link for injection into an AI grading prompt. Uses Google's
 * export endpoints — works without auth as long as the doc is set
 * to "Anyone with the link can view." Most students share that way
 * (the submission form already nudges them to confirm shareability).
 *
 * For private docs we silently return ok:false — the caller falls
 * back to scoring based on text body alone, and the prompt is
 * adjusted so Claude doesn't penalize the student for the tool
 * limitation.
 */

const MAX_CHARS = 30_000;

type GDocType = "document" | "spreadsheets" | "presentation";

export type ParsedGDoc = { id: string; type: GDocType };

export function parseGoogleDocsUrl(url: string): ParsedGDoc | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "docs.google.com") return null;
    const m = u.pathname.match(
      /^\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/,
    );
    if (!m) return null;
    return { type: m[1] as GDocType, id: m[2] };
  } catch {
    return null;
  }
}

const EXPORT_FORMAT: Record<GDocType, string> = {
  document: "txt",
  spreadsheets: "csv",
  presentation: "txt",
};

const KIND_LABEL: Record<GDocType, string> = {
  document: "Google Doc",
  spreadsheets: "Google Sheet (exported as CSV)",
  presentation: "Google Slides (exported as text)",
};

export type GDocFetchResult = {
  ok: boolean;
  formatted: string;
  charCount: number;
  /** false when the doc isn't publicly shared — the caller should
   *  use this to decide whether to tell Claude "we tried but couldn't
   *  see it" vs "we never tried." */
  attemptedButPrivate: boolean;
};

export async function fetchGoogleDocForPrompt(
  parsed: ParsedGDoc,
): Promise<GDocFetchResult> {
  const exportUrl = `https://docs.google.com/${parsed.type}/d/${parsed.id}/export?format=${EXPORT_FORMAT[parsed.type]}`;
  try {
    const r = await fetch(exportUrl, {
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!r.ok) {
      return {
        ok: false,
        formatted: "",
        charCount: 0,
        attemptedButPrivate: true,
      };
    }
    const text = await r.text();

    // The export endpoint redirects unauthenticated requests for
    // private docs to a sign-in HTML page. Sniff for that and treat
    // it as "couldn't access".
    const looksLikeHtml =
      text.startsWith("<!DOCTYPE") ||
      text.startsWith("<html") ||
      text.includes("accounts.google.com/ServiceLogin");
    if (looksLikeHtml) {
      return {
        ok: false,
        formatted: "",
        charCount: 0,
        attemptedButPrivate: true,
      };
    }

    const trimmed = text.slice(0, MAX_CHARS);
    const truncationNote = text.length > MAX_CHARS ? "\n\n_(truncated)_" : "";
    const formatted = `## ${KIND_LABEL[parsed.type]}\n\n${trimmed}${truncationNote}`;
    return {
      ok: true,
      formatted,
      charCount: formatted.length,
      attemptedButPrivate: false,
    };
  } catch (err) {
    console.warn("[googleDocsFetch]", err);
    return {
      ok: false,
      formatted: "",
      charCount: 0,
      attemptedButPrivate: true,
    };
  }
}
