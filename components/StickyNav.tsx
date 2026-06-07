"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Wordmark } from "./Wordmark";

const SCROLL_THRESHOLD = 80;

/**
 * Sticky top navigation. Transparent over the hero, fades to solid cream
 * + hairline border after the first 80px of scroll. Editorial publication
 * feel: no backdrop blur, no dropshadow, just a thin rule.
 */
export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transitionDuration = reducedMotion ? 0 : 0.3;

  return (
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
      transition={{ duration: transitionDuration, ease: [0.22, 0.61, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
    >
      <nav
        aria-label="Primary"
        className="mx-auto max-w-[1240px] px-6 sm:px-10 md:px-16 h-[60px] sm:h-[68px] flex items-center justify-between"
      >
        <Wordmark size="sm" />

        {/* Desktop links + CTA */}
        <div className="hidden lg:flex items-center gap-8">
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

        {/* Mobile: just the CTA */}
        <Link
          href="/#waitlist"
          className="
            lg:hidden
            text-[13px] font-medium tracking-[0.01em]
            bg-oxblood text-cream
            px-3.5 py-2
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
          "
        >
          Get early access
        </Link>
      </nav>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        text-[14px] tracking-[0.005em] text-muted
        hover:text-ink transition-colors duration-200 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink
      "
    >
      {children}
    </Link>
  );
}
