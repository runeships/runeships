import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "Terms — RuneShips",
  description: "Terms of service for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

const TERMS_BODY = `
## About

RuneShips is a skill assessment platform operated by Diego Marjotie. By using the platform, you agree to these terms.

## Your account

You're responsible for keeping your sign-in email secure. We assume submissions are made by the account holder.

## Your submissions

You retain ownership of work you submit. By submitting, you grant us a non-exclusive license to evaluate it via AI and (with your opt-in) display it to prospective recruiters. We will not republish your work outside the platform.

## Acceptable use

- Don't submit work that isn't yours unless properly attributed
- Don't submit illegal, harassing, or hateful content
- Don't attempt to game scores through automated submissions or coordinated inauthentic activity

## AI feedback

AI-generated scores and feedback are advisory. They reflect one model's evaluation at one point in time. They are not a guarantee of skill, employability, or suitability for any specific role.

## Account termination

We may suspend or terminate accounts that violate these terms. You may delete your account at any time from [/profile?tab=account](/profile?tab=account).

## Limitation of liability

RuneShips is provided "as is." We aren't liable for indirect or consequential damages from use of the platform.

## Changes

We'll post updates here and notify active users of material changes.

## Contact

Questions to [hello@runeships.com](mailto:hello@runeships.com).
`.trim();

export default function TermsPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Terms
        </p>
        <h1
          className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Terms of service.
        </h1>

        <EditorialMarkdown content={TERMS_BODY} className="mt-10" />

        <p className="mt-16 text-[12px] tracking-[0.04em] text-muted">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 pl-6 sm:pl-8 border-l-2 border-ink/15 max-w-[60ch]">
          <p className="text-[13px] leading-[1.6] text-muted">
            These terms are an MVP draft. RuneShips will engage proper legal
            review before scaling to broader use.
          </p>
        </div>

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
