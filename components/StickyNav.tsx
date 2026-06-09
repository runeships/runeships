"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

// Source artwork intrinsic dimensions — display size is controlled by
// CSS (h-7 w-auto). Next/Image still needs width+height for layout.
const LOGO_W = 802;
const LOGO_H = 264;

const SCROLL_THRESHOLD = 80;

/**
 * Sticky top navigation.
 *
 * - Transparent over the hero, fades to solid cream + hairline border
 *   after 80px scroll (300ms ease).
 * - When scrolled, a tiny ᛟ rune appears before the wordmark like a
 *   publication's masthead glyph.
 * - Nav links use the `.link-anim` left→right underline on hover.
 * - On mobile, the desktop link list collapses into a hamburger that
 *   opens a full-screen takeover menu.
 */
export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the route changes (the user clicked a link)
  useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [mobileOpen]);

  // Lock body scroll while the takeover menu is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // ESC closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const transitionDuration = reducedMotion ? 0 : 0.3;

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? "rgba(250, 250, 247, 0.96)"
            : "rgba(250, 250, 247, 0)",
          borderBottomColor: scrolled
            ? "rgba(231, 226, 220, 1)"
            : "rgba(231, 226, 220, 0)",
        }}
        transition={{
          duration: transitionDuration,
          ease: [0.22, 0.61, 0.36, 1],
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b"
      >
        <nav
          aria-label="Primary"
          className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 h-[60px] sm:h-[68px] flex items-center justify-between"
        >
          {/* Brand: horizontal logo image. Tiny ᛟ masthead glyph fades in
              before it on scroll, like a publication's nameplate. */}
          <div className="flex items-center gap-2.5">
            <AnimatePresence initial={false}>
              {scrolled && (
                <motion.span
                  key="masthead-rune"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{
                    duration: transitionDuration,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  className="font-rune text-oxblood text-[14px] leading-none"
                  aria-hidden
                >
                  ᛟ
                </motion.span>
              )}
            </AnimatePresence>
            <Link
              href="/"
              aria-label="RuneShips — home"
              className="inline-flex items-center"
            >
              <Image
                src="/brand/runeships-horizontal.png"
                alt="RuneShips"
                width={LOGO_W}
                height={LOGO_H}
                priority
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop links + CTA */}
          <div className="hidden lg:flex items-center gap-9">
            <NavLink href="/#how-it-works">How it works</NavLink>
            <NavLink href="/#students">For students</NavLink>
            <NavLink href="/#companies">For companies</NavLink>
            <Link
              href="/#waitlist"
              className="
                text-[13px] font-medium tracking-[0.01em]
                bg-oxblood text-cream
                px-4 py-2.5
                transition-colors duration-200 ease-out
                hover:bg-oxblood-hover
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              "
            >
              Get early access
            </Link>
          </div>

          {/* Mobile: hamburger trigger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
            className="
              lg:hidden
              w-10 h-10 -mr-2 flex flex-col items-center justify-center gap-[5px]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
            "
          >
            <span aria-hidden className="block w-6 h-px bg-ink" />
            <span aria-hidden className="block w-6 h-px bg-ink" />
          </button>
        </nav>
      </motion.header>

      {/* Mobile takeover menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.22,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            className="fixed inset-0 z-50 bg-cream lg:hidden"
          >
            <div className="px-6 sm:px-10 h-[60px] sm:h-[68px] flex items-center justify-between border-b border-rule">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="font-rune text-oxblood text-[14px] leading-none">
                  ᛟ
                </span>
                <Image
                  src="/brand/runeships-horizontal.png"
                  alt="RuneShips"
                  width={LOGO_W}
                  height={LOGO_H}
                  className="h-7 sm:h-8 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="
                  w-10 h-10 -mr-2 flex items-center justify-center
                  text-ink hover:text-oxblood transition-colors duration-200 ease-out
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
                "
              >
                <span aria-hidden className="text-[26px] leading-none">×</span>
              </button>
            </div>

            <nav
              aria-label="Site menu"
              className="flex flex-col gap-8 px-8 pt-16"
            >
              <MobileLink href="/#how-it-works" onClick={() => setMobileOpen(false)}>
                How it works
              </MobileLink>
              <MobileLink href="/#students" onClick={() => setMobileOpen(false)}>
                For students
              </MobileLink>
              <MobileLink href="/#companies" onClick={() => setMobileOpen(false)}>
                For companies
              </MobileLink>
              <MobileLink href="/proof" onClick={() => setMobileOpen(false)}>
                Methodology
              </MobileLink>
              <MobileLink href="/story" onClick={() => setMobileOpen(false)}>
                Founder story
              </MobileLink>

              <div className="mt-6">
                <Link
                  href="/#waitlist"
                  onClick={() => setMobileOpen(false)}
                  className="
                    inline-flex items-center
                    min-h-[56px] px-7
                    bg-oxblood text-cream
                    border border-oxblood
                    text-[15px] tracking-[0.01em] font-medium
                    transition-colors duration-200 ease-out
                    hover:bg-oxblood-hover
                  "
                >
                  Get early access
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        link-anim text-[14px] tracking-[0.005em] text-muted
        hover:text-ink transition-colors duration-200 ease-out
        focus-visible:outline-none focus-visible:text-ink
      "
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        font-display font-light text-[34px] sm:text-[40px] leading-[1.1]
        tracking-[-0.018em] text-ink
        hover:text-oxblood transition-colors duration-200 ease-out
      "
    >
      {children}
    </Link>
  );
}
