import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — RuneShips",
  description: "Terms of service for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

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

        <Section title="About">
          <p>
            RuneShips is a skill assessment platform operated by Diego Marjotie.
            By using the platform, you agree to these terms.
          </p>
        </Section>

        <Section title="Your account">
          <p>
            You&rsquo;re responsible for keeping your sign-in email secure. We
            assume submissions are made by the account holder.
          </p>
        </Section>

        <Section title="Your submissions">
          <p>
            You retain ownership of work you submit. By submitting, you grant
            us a non-exclusive license to evaluate it via AI and (with your
            opt-in) display it to prospective recruiters. We will not republish
            your work outside the platform.
          </p>
        </Section>

        <Section title="Acceptable use">
          <ul>
            <li>
              Don&rsquo;t submit work that isn&rsquo;t yours unless properly
              attributed
            </li>
            <li>Don&rsquo;t submit illegal, harassing, or hateful content</li>
            <li>
              Don&rsquo;t attempt to game scores through automated submissions
              or coordinated inauthentic activity
            </li>
          </ul>
        </Section>

        <Section title="AI feedback">
          <p>
            AI-generated scores and feedback are advisory. They reflect one
            model&rsquo;s evaluation at one point in time. They are not a
            guarantee of skill, employability, or suitability for any specific
            role.
          </p>
        </Section>

        <Section title="Account termination">
          <p>
            We may suspend or terminate accounts that violate these terms. You
            may delete your account at any time from{" "}
            <Link href="/profile?tab=account" className={linkCls}>
              /profile?tab=account
            </Link>
            .
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            RuneShips is provided &ldquo;as is.&rdquo; We aren&rsquo;t liable
            for indirect or consequential damages from use of the platform.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We&rsquo;ll post updates here and notify active users of material
            changes.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions to{" "}
            <a href="mailto:hello@runeships.com" className={linkCls}>
              hello@runeships.com
            </a>
            .
          </p>
        </Section>

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 sm:mt-16">
      <h2 className="font-display font-light text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.018em] text-ink">
        {title}
      </h2>
      <hr className="mt-3 border-0 border-t border-ink/10" />
      <div className="mt-6 prose-editorial text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-[1.6]">
        {children}
      </div>
    </section>
  );
}
