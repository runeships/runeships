import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies — RuneShips",
  description: "Cookie policy for RuneShips.",
};

const LAST_UPDATED = "June 12, 2026";

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

        <Section title="What we use">
          <p>
            RuneShips uses a small set of cookies, only the ones needed to
            make the platform work. We don&rsquo;t use advertising or tracking
            cookies.
          </p>
        </Section>

        <Section title="Essential cookies">
          <ul>
            <li>Authentication session (keeps you signed in)</li>
            <li>Security tokens (prevents form forgery)</li>
            <li>Site preferences (remembers any UI choices you make)</li>
          </ul>
        </Section>

        <Section title="Analytics">
          <p>
            We use Vercel Analytics, which is privacy-friendly and doesn&rsquo;t
            use cookies or track individuals — it aggregates page views without
            identifying users.
          </p>
        </Section>

        <Section title="Your control">
          <p>
            You can clear all RuneShips cookies from your browser settings.
            Doing so will sign you out.
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
