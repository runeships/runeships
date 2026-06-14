/**
 * Fetch a GitHub repo's README + top-level tree + key entry files,
 * format as a markdown block to inject into an AI grading prompt.
 *
 * No auth required for public repos (60 req/hr per IP). For higher
 * rate limit, set GITHUB_TOKEN env var.
 *
 * Cap is per-call: total characters returned never exceed
 * MAX_TOTAL_CHARS (50_000). Bigger repos get truncated, not skipped.
 */

const MAX_TOTAL_CHARS = 50_000;
const MAX_FILE_CHARS = 8_000;
const KEY_FILES = [
  "package.json",
  "requirements.txt",
  "Cargo.toml",
  "go.mod",
  "pyproject.toml",
  "Gemfile",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
];
const SOURCE_DIRS = ["src", "app", "lib", "pages", "components"];

type ParsedRepo = { owner: string; repo: string };

export function parseGithubUrl(url: string): ParsedRepo | null {
  try {
    const u = new URL(url);
    if (!/^(www\.)?github\.com$/.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    let repo = parts[1];
    if (repo.endsWith(".git")) repo = repo.slice(0, -4);
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

type GhFile = {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  size?: number;
};

export type RepoFetchResult = {
  ok: boolean;
  formatted: string;
  charCount: number;
};

export async function fetchRepoForPrompt(
  parsed: ParsedRepo,
): Promise<RepoFetchResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RuneShips-AI-Grader",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const base = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  let chars = 0;
  const sections: string[] = [];
  sections.push(`## Repository: ${parsed.owner}/${parsed.repo}`);

  // 1. Repo metadata.
  try {
    const r = await fetch(base, { headers, signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const meta = (await r.json()) as {
        description?: string | null;
        language?: string | null;
        stargazers_count?: number;
        default_branch?: string;
        size?: number;
      };
      const metaLines = [
        meta.description ? `Description: ${meta.description}` : null,
        meta.language ? `Primary language: ${meta.language}` : null,
        typeof meta.stargazers_count === "number"
          ? `Stars: ${meta.stargazers_count}`
          : null,
        meta.default_branch ? `Default branch: ${meta.default_branch}` : null,
      ].filter(Boolean) as string[];
      if (metaLines.length > 0) {
        const block = metaLines.join("\n");
        chars += block.length;
        sections.push(block);
      }
    } else if (r.status === 404) {
      return {
        ok: false,
        formatted: `## Repository: ${parsed.owner}/${parsed.repo}\n_(404 — repo not found or private)_`,
        charCount: 0,
      };
    }
  } catch (err) {
    console.warn("[githubFetch meta]", err);
  }

  // 2. README.
  try {
    const r = await fetch(`${base}/readme`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      const j = (await r.json()) as {
        content?: string;
        encoding?: string;
      };
      if (j.content && j.encoding === "base64") {
        const decoded = Buffer.from(j.content, "base64").toString("utf-8");
        const trimmed = decoded.slice(0, MAX_FILE_CHARS);
        const block = `### README\n\n${trimmed}${decoded.length > MAX_FILE_CHARS ? "\n\n_(truncated)_" : ""}`;
        if (chars + block.length <= MAX_TOTAL_CHARS) {
          chars += block.length;
          sections.push(block);
        }
      }
    }
  } catch (err) {
    console.warn("[githubFetch readme]", err);
  }

  // 3. Top-level tree.
  let topLevel: GhFile[] = [];
  try {
    const r = await fetch(`${base}/contents/`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) {
      topLevel = (await r.json()) as GhFile[];
    }
  } catch (err) {
    console.warn("[githubFetch tree]", err);
  }

  if (topLevel.length > 0) {
    const listing = topLevel
      .map((e) => `- ${e.name}${e.type === "dir" ? "/" : ""}`)
      .join("\n");
    const block = `### Top-level file tree\n\n${listing}`;
    if (chars + block.length <= MAX_TOTAL_CHARS) {
      chars += block.length;
      sections.push(block);
    }
  }

  // 4. Key config files.
  for (const filename of KEY_FILES) {
    if (chars >= MAX_TOTAL_CHARS) break;
    const file = topLevel.find(
      (f) => f.type === "file" && f.name === filename,
    );
    if (!file?.download_url) continue;
    const content = await fetchFile(file.download_url, headers);
    if (!content) continue;
    const block = `### ${file.path}\n\n\`\`\`\n${content}\n\`\`\``;
    if (chars + block.length > MAX_TOTAL_CHARS) break;
    chars += block.length;
    sections.push(block);
  }

  // 5. A handful of source files from common dirs.
  for (const dirName of SOURCE_DIRS) {
    if (chars >= MAX_TOTAL_CHARS) break;
    const dir = topLevel.find((f) => f.type === "dir" && f.name === dirName);
    if (!dir) continue;
    try {
      const r = await fetch(`${base}/contents/${dir.path}`, {
        headers,
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) continue;
      const children = (await r.json()) as GhFile[];
      const files = children
        .filter((c) => c.type === "file" && c.download_url)
        .slice(0, 4);
      for (const f of files) {
        if (chars >= MAX_TOTAL_CHARS) break;
        const content = await fetchFile(f.download_url!, headers);
        if (!content) continue;
        const block = `### ${f.path}\n\n\`\`\`\n${content}\n\`\`\``;
        if (chars + block.length > MAX_TOTAL_CHARS) break;
        chars += block.length;
        sections.push(block);
      }
    } catch (err) {
      console.warn(`[githubFetch dir ${dirName}]`, err);
    }
  }

  const formatted = sections.join("\n\n");
  return { ok: true, formatted, charCount: formatted.length };
}

async function fetchFile(
  downloadUrl: string,
  headers: Record<string, string>,
): Promise<string | null> {
  try {
    const r = await fetch(downloadUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const txt = await r.text();
    return txt.slice(0, MAX_FILE_CHARS);
  } catch {
    return null;
  }
}
