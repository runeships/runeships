import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type EditorialMarkdownProps = {
  content: string;
  /** Tailwind classes added to the wrapping <div>. Typically used to
   *  set the reading column (mx-auto max-w-[680px]) or top margin. */
  className?: string;
};

/**
 * Single source of truth for rendering long-form prose. Wraps
 * react-markdown with brand-matched component renderers so task
 * briefs, AI feedback, and the editorial article pages (proof,
 * story, privacy, cookies, terms) all share one typography system.
 *
 * Server component — no hooks, no event handlers. Each custom
 * renderer is a simple JSX mapping the markdown node to an HTML
 * element with editorial styling.
 */
export function EditorialMarkdown({
  content,
  className = "",
}: EditorialMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

const COMPONENTS: Components = {
  // ─── Headings ─────────────────────────────────────────────────
  // H1 inside markdown content reads as the article's internal title
  // (task briefs start with one). Smaller than the page-hero H1.
  h1: ({ children, ...props }) => (
    <h1
      className="font-display font-light leading-[1.1] tracking-[-0.02em] text-ink first:mt-0 mt-12 mb-6"
      style={{
        fontSize: "clamp(2rem, 2.6vw + 1rem, 2.5rem)",
        fontVariationSettings: '"opsz" 144',
      }}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="font-display font-light leading-[1.2] tracking-[-0.018em] text-ink mt-10 mb-4 pb-3 border-b border-ink/10"
      style={{ fontSize: "clamp(1.5rem, 1.2vw + 1rem, 1.75rem)" }}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="font-display font-normal leading-[1.25] tracking-[-0.012em] text-ink mt-7 mb-3"
      style={{ fontSize: "clamp(1.125rem, 0.4vw + 1rem, 1.25rem)" }}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="font-display font-normal text-[16px] leading-[1.3] tracking-[-0.005em] text-ink mt-5 mb-2"
      {...props}
    >
      {children}
    </h4>
  ),

  // ─── Block text ───────────────────────────────────────────────
  p: ({ children, ...props }) => (
    <p
      className="text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 mt-4 first:mt-0"
      {...props}
    >
      {children}
    </p>
  ),

  // ─── Lists ────────────────────────────────────────────────────
  // ul uses the disc marker tinted oxblood for an editorial feel —
  // the spec prefers em-dash markers, but ::marker `content`
  // support is uneven across browsers; tinted disc reads cleanly
  // and works everywhere. Indent matches the prose column.
  ul: ({ children, ...props }) => (
    <ul
      className="mt-4 pl-6 list-disc marker:text-oxblood/60 space-y-2 text-[15px] sm:text-[16px] leading-[1.65] text-ink/85"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="mt-4 pl-6 list-decimal marker:font-display marker:text-oxblood/70 space-y-2 text-[15px] sm:text-[16px] leading-[1.65] text-ink/85"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => <li {...props}>{children}</li>,

  // ─── Inline emphasis ──────────────────────────────────────────
  strong: ({ children, ...props }) => (
    <strong className="text-oxblood font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-ink/80" {...props}>
      {children}
    </em>
  ),

  // ─── Links ────────────────────────────────────────────────────
  a: ({ href, children, ...props }) => {
    const external =
      typeof href === "string" &&
      (href.startsWith("http") || href.startsWith("mailto:"));
    return (
      <a
        href={href}
        target={
          typeof href === "string" && href.startsWith("http")
            ? "_blank"
            : undefined
        }
        rel={
          external && typeof href === "string" && href.startsWith("http")
            ? "noopener noreferrer"
            : undefined
        }
        className="link-anim text-oxblood hover:text-oxblood-hover underline decoration-oxblood/40 underline-offset-[3px] transition-colors duration-200 ease-out"
        {...props}
      >
        {children}
      </a>
    );
  },

  // ─── Code ─────────────────────────────────────────────────────
  // Inline code vs code blocks: react-markdown wraps fenced code in
  // <pre><code>. When `code` appears outside <pre> it's inline.
  // remark-gfm gives us `inline` flag implicitly via parent context.
  code: ({ children, className: cls, ...props }) => {
    // Heuristic: if className is set (language-foo) it's a block
    // child of <pre>; if not, it's inline.
    if (cls) {
      return (
        <code
          className={`${cls} font-mono text-[13.5px] leading-[1.6]`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="font-mono text-[0.92em] bg-parchment text-ink px-1.5 py-0.5 rounded-[2px]"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre
      className="mt-5 mb-5 bg-cream border-l-[3px] border-oxblood px-4 py-3 overflow-x-auto text-[13.5px] leading-[1.6] text-ink"
      {...props}
    >
      {children}
    </pre>
  ),

  // ─── Quote ────────────────────────────────────────────────────
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mt-5 mb-5 border-l-2 border-oxblood bg-parchment/60 px-5 py-4 font-display italic text-[16px] leading-[1.6] text-ink/85"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // ─── Rule ─────────────────────────────────────────────────────
  hr: () => <hr className="my-8 border-0 border-t border-oxblood/30" />,

  // ─── GFM tables ───────────────────────────────────────────────
  table: ({ children, ...props }) => (
    <div className="mt-5 mb-5 overflow-x-auto">
      <table
        className="w-full border-collapse text-[14px] tracking-[-0.005em]"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-parchment" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="text-left text-[11px] tracking-[0.12em] uppercase text-muted font-normal px-3 py-2 border-b border-ink/15"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-3 py-2.5 border-b border-ink/10 text-ink/85"
      {...props}
    >
      {children}
    </td>
  ),

  // ─── Image ────────────────────────────────────────────────────
  // Plain <img> — markdown images aren't routed through next/image
  // because their dimensions aren't known at parse time. Disabling
  // the next/image lint rule explicitly because react-markdown sends
  // remote-or-local URLs that next/image can't always handle.
  img: ({ src, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : undefined}
      alt={alt ?? ""}
      className="mt-5 mb-5 max-w-full h-auto border border-ink/15 rounded-[2px]"
      {...props}
    />
  ),
};
