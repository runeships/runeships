import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — RuneShips",
  description: "Privacy policy for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

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

        <Section title="Our approach">
          <p>
            RuneShips collects only what&rsquo;s needed to assess your skills
            and connect you with companies. We don&rsquo;t sell your data.
            Ever.
          </p>
        </Section>

        <Section title="What we collect">
          <ul>
            <li>Account: email, name, school, graduation year</li>
            <li>Self-rated skills, career interests</li>
            <li>Submissions you create and their AI-generated feedback</li>
            <li>
              Standard server logs (IP, browser, timestamps) for security and
              debugging
            </li>
          </ul>
        </Section>

        <Section title="How we use it">
          <ul>
            <li>To generate personalized AI feedback on your work</li>
            <li>To compute your skill scores and percentile rankings</li>
            <li>
              To show your profile to companies if you opt in to recruiter
              visibility (this feature is in development; we&rsquo;ll ask
              before making your profile visible)
            </li>
            <li>
              To send transactional emails (account confirmations, feedback
              ready notifications)
            </li>
          </ul>
        </Section>

        <Section title="Who we share it with">
          <ul>
            <li>Supabase (our database and authentication provider)</li>
            <li>Anthropic (the AI provider that generates your feedback)</li>
            <li>Resend (our transactional email provider)</li>
            <li>Vercel (our hosting provider)</li>
            <li>Nobody else, unless required by law</li>
          </ul>
        </Section>

        <Section title="Your rights">
          <h3 className={subheadingCls}>Access</h3>
          <p>
            Request a copy of all your data via{" "}
            <a href="mailto:hello@runeships.com" className={linkCls}>
              hello@runeships.com
            </a>
            .
          </p>
          <h3 className={subheadingCls}>Deletion</h3>
          <p>
            Delete your account anytime from{" "}
            <Link href="/profile?tab=account" className={linkCls}>
              /profile?tab=account
            </Link>
            , or email us.
          </p>
          <h3 className={subheadingCls}>Correction</h3>
          <p>
            Edit your profile data directly in{" "}
            <Link href="/profile" className={linkCls}>
              /profile
            </Link>
            .
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For privacy questions, email{" "}
            <a href="mailto:hello@runeships.com" className={linkCls}>
              hello@runeships.com
            </a>
            . We respond within 30 days.
          </p>
        </Section>

        <Section title="Updates">
          <p>
            We&rsquo;ll post material changes here and notify active users by
            email.
          </p>
        </Section>

        <p className="mt-16 text-[12px] tracking-[0.04em] text-muted">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-16 pt-10 border-t border-rule">
          <Link href="/" className="link-anim text-[14px] tracking-[0.01em] text-ink transition-colors duration-200 ease-out">
            <span aria-hidden>←</span> Back to RuneShips
          </Link>
        </div>
      </article>
    </main>
  );
}

const linkCls =
  "link-anim text-oxblood hover:text-oxblood-hover transition-colors duration-200 ease-out";

const subheadingCls =
  "mt-7 font-display font-normal text-[16px] tracking-[-0.01em] text-ink";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 sm:mt-16">
      <h2
        className="font-display font-light text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.018em] text-ink"
      >
        {title}
      </h2>
      <hr className="mt-3 border-0 border-t border-ink/10" />
      <div className="mt-6 prose-editorial text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-[1.6]">
        {children}
      </div>
    </section>
  );
}
