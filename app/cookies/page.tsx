import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "Cookies — RuneShips",
  description: "Cookie policy for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

const COOKIES_BODY = `
## What we use

RuneShips uses a small set of cookies, only the ones needed to make the platform work. We don't use advertising or tracking cookies.

## Essential cookies

- Authentication session (keeps you signed in)
- Security tokens (prevents form forgery)
- Site preferences (remembers any UI choices you make)

## Analytics

We use Vercel Analytics, which is privacy-friendly and doesn't use cookies or track individuals — it aggregates page views without identifying users.

## Your control

You can clear all RuneShips cookies from your browser settings. Doing so will sign you out.
`.trim();

export default function CookiesPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Cookies
        </p>
        <h1
          className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Cookie policy.
        </h1>

        <EditorialMarkdown content={COOKIES_BODY} className="mt-10" />

        <p className="mt-16 text-[12px] tracking-[0.04em] text-muted">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-16 pt-10 border-t border-rule">
          <Link
            href="/"
            className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out"
          >
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}
