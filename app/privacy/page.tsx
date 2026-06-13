import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "Privacy — RuneShips",
  description: "Privacy policy for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

const PRIVACY_BODY = `
## Our approach

RuneShips collects only what's needed to assess your skills and connect you with companies. We don't sell your data. Ever.

## What we collect

- Account: email, name, school, graduation year
- Self-rated skills, career interests
- Submissions you create and their AI-generated feedback
- Standard server logs (IP, browser, timestamps) for security and debugging

## How we use it

- To generate personalized AI feedback on your work
- To compute your skill scores and percentile rankings
- To show your profile to companies if you opt in to recruiter visibility (this feature is in development; we'll ask before making your profile visible)
- To send transactional emails (account confirmations, feedback ready notifications)

## Who we share it with

- Supabase (our database and authentication provider)
- Anthropic (the AI provider that generates your feedback)
- Resend (our transactional email provider)
- Vercel (our hosting provider)
- Nobody else, unless required by law

## Your rights

### Access

Request a copy of all your data via [hello@runeships.com](mailto:hello@runeships.com).

### Deletion

Delete your account anytime from [/profile?tab=account](/profile?tab=account), or email us.

### Correction

Edit your profile data directly in [/profile](/profile).

## Contact

For privacy questions, email [hello@runeships.com](mailto:hello@runeships.com). We respond within 30 days.

## Updates

We'll post material changes here and notify active users by email.
`.trim();

export default function PrivacyPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Privacy
        </p>
        <h1
          className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Privacy policy.
        </h1>

        <EditorialMarkdown content={PRIVACY_BODY} className="mt-10" />

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
