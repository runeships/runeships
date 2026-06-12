import Link from "next/link";

/**
 * Site-wide footer mounted in app/layout.tsx. Appears on every page,
 * marketing and app alike. Editorial: a single hairline, three text
 * links with bullet separators, copyright below in even smaller
 * muted type.
 */
export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 py-10 sm:py-12 flex flex-col items-center gap-3">
        <nav aria-label="Legal" className="text-[12px] tracking-[0.04em] text-muted">
          <Link
            href="/privacy"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            Privacy
          </Link>
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          <Link
            href="/cookies"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            Cookies
          </Link>
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          <Link
            href="/terms"
            className="link-anim hover:text-ink transition-colors duration-200 ease-out"
          >
            Terms
          </Link>
        </nav>
        <p className="text-[11px] tracking-[0.04em] text-muted/80">
          © 2026 RuneShips
        </p>
      </div>
    </footer>
  );
}
