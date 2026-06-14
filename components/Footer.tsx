import Link from "next/link";
import { CookieSettingsLink } from "./CookieSettingsLink";

/**
 * Site-wide footer mounted in app/layout.tsx. Appears on every page,
 * marketing and app alike. Two editorial link rows: "About" (story +
 * methodology) and "Legal" (privacy + cookies + terms), copyright
 * below in even smaller muted type.
 */
export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 py-10 sm:py-12 flex flex-col items-center gap-3">
        <nav
          aria-label="About"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <FooterLink href="/story">Story</FooterLink>
          <Separator />
          <FooterLink href="/proof">Methodology</FooterLink>
        </nav>
        <nav
          aria-label="Legal"
          className="text-[12px] tracking-[0.04em] text-muted"
        >
          <FooterLink href="/privacy">Privacy</FooterLink>
          <Separator />
          <FooterLink href="/cookies">Cookies</FooterLink>
          <Separator />
          <FooterLink href="/terms">Terms</FooterLink>
          <Separator />
          <CookieSettingsLink />
        </nav>
        <p className="mt-1 text-[11px] tracking-[0.04em] text-muted/80">
          © 2026 RuneShips
        </p>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="link-anim hover:text-ink transition-colors duration-200 ease-out"
    >
      {children}
    </Link>
  );
}

function Separator() {
  return (
    <span aria-hidden className="mx-2 text-muted/50">
      ·
    </span>
  );
}
