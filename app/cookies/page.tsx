import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";

export const metadata: Metadata = {
  title: "Cookies Policy — RuneShips",
  description: "What cookies RuneShips sets, why, and how to control them.",
};

const EFFECTIVE_DATE = "June 14, 2026";
const LAST_UPDATED = "June 14, 2026";

const COOKIES_BODY = `
## 1. What this policy covers

This Cookies Policy explains how RuneShips ("we," "us," or "our") uses cookies and similar technologies on runeships.com. It complements our [Privacy Policy](/privacy), which describes the broader handling of your personal information.

If you continue to use the platform after reading this policy, you agree to the use of cookies as described here. You can change your mind at any time using the Cookie settings entry point in the footer.

## 2. What are cookies

Cookies are small text files that a website places on your device when you visit it. They let the site remember things between page loads — for example, that you're signed in.

Similar technologies include browser **local storage** and **session storage**. These don't get sent back to a server with every request the way cookies do, but they serve overlapping purposes. This policy covers both.

We don't use Flash cookies, web beacons, fingerprinting, or any cross-site tracking technology.

## 3. How we use cookies

RuneShips uses cookies for **essential** purposes only. There are three categories of cookie use you'll see across the web:

- **Essential** — required for the platform to function (authentication, session, security). You can't opt out of these without breaking sign-in.
- **Functional** — remember preferences (theme, language). We don't currently use any.
- **Analytics / Advertising** — measure usage or target ads. **We don't use any of these.**

Every cookie we set falls in the essential category.

## 4. The cookies we set

| Name | Purpose | Duration | Category |
|------|---------|----------|----------|
| \`sb-kbokzwvnqeuxkcxigkdh-auth-token\` | Stores your Supabase authentication session so you stay signed in between visits. Set when you sign in via the magic-link flow. | Up to 1 year (refreshed on use) | Essential |
| \`sb-kbokzwvnqeuxkcxigkdh-auth-token-code-verifier\` | Briefly stores the PKCE verifier during magic-link sign-in. Cleared automatically once the sign-in flow completes. | A few minutes (one-time) | Essential |
| \`runeships_cookie_consent\` | Records that you've seen and acknowledged this cookie banner so it doesn't reappear on every visit. Set when you click "OK, got it" in the banner. | 12 months | Essential |

That's it — three cookies, all first-party (set by runeships.com), all strictly necessary.

The Supabase cookies (\`sb-kbokzwvnqeuxkcxigkdh-...\`) are set by our database and authentication provider, Supabase. The project identifier \`kbokzwvnqeuxkcxigkdh\` is our specific Supabase project reference. These cookies travel only between your browser and runeships.com — they aren't shared with Supabase's other customers or with any third party.

## 5. Third-party cookies

We don't use third-party cookies. Specifically:

- No advertising cookies (Google Ads, Meta Pixel, etc.)
- No third-party analytics cookies (Google Analytics, Mixpanel, Segment, etc.)
- No social media cookies (Twitter/X, LinkedIn embeds, etc.)
- No tracking pixels of any kind

Our hosting provider Vercel does not set tracking cookies in the configuration we use. Vercel may serve our pages from its CDN, but no Vercel-controlled cookie is placed on your device by browsing runeships.com.

## 6. Do Not Track signals

Some browsers can send a "Do Not Track" (DNT) signal with each request. There's no industry consensus on how websites should respond to DNT, so we don't behave differently when we receive it — but since we don't track you in the first place, this doesn't change what gets set on your device.

We also honor the Global Privacy Control (GPC) signal where it's a legal requirement. For users in jurisdictions where GPC is recognized as a valid opt-out (e.g., California, Colorado, Connecticut), receiving the signal has no practical effect on RuneShips because we don't sell or share personal information for advertising — but we respect the signal as a matter of policy.

## 7. Local storage and similar technologies

We use a small amount of browser local storage for transient UI state — for example, remembering which informational popovers you've dismissed within a session. These values:

- Live only on your device
- Aren't sent to our servers
- Don't contain personal information
- Can be cleared from your browser settings at any time

We don't use IndexedDB, Service Worker caches, or other persistent client-side databases for personal data.

## 8. How to control cookies

You have several ways to control cookies on RuneShips:

- **Reset your cookie banner.** Use the **Cookie settings** link in the footer of every page, or the button at the bottom of this policy. This clears your acknowledgment so the banner reappears on your next page load.
- **Clear cookies in your browser.** Every modern browser lets you delete cookies for a specific site. Doing this for runeships.com will sign you out and bring the cookie banner back. See your browser's help docs:
  - [Chrome](https://support.google.com/chrome/answer/95647)
  - [Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)
  - [Safari](https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac)
  - [Edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)
- **Block cookies entirely.** You can browse our marketing pages (the home page, /story, /proof, /companies marketing) without cookies. Signed-in features (dashboard, profile, submissions) require the Supabase auth cookies to work.
- **Sign out.** Signing out from [/profile?tab=account](/profile?tab=account) clears the Supabase auth cookies.

## 9. How long cookies last

Cookie lifetimes are listed in the table in section 4. In summary:

- \`runeships_cookie_consent\`: **12 months** from acknowledgment.
- Supabase auth cookies: persist as long as you stay signed in, with periodic refresh. Clearing them or signing out removes them.
- The PKCE verifier cookie: deleted within minutes, automatically.

We don't intentionally set any cookie with a lifetime longer than 12 months.

## 10. Changes to this policy

We may update this policy from time to time — for example, if we add a new essential cookie or change how an existing one works. Material changes will be posted at runeships.com/cookies with an updated "Last updated" date, and we'll re-show the cookie banner so you can review the change.

## 11. Contact

Questions about cookies? Email us at [hello@runeships.com](mailto:hello@runeships.com). For broader privacy questions, see our [Privacy Policy](/privacy) or contact the same address.
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
          Cookies policy.
        </h1>

        <p className="mt-6 text-[13px] tracking-[0.04em] text-muted">
          Effective date: {EFFECTIVE_DATE}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Last updated: {LAST_UPDATED}
        </p>

        <EditorialMarkdown content={COOKIES_BODY} className="mt-10" />

        {/* Reset banner inset — sits right after the markdown so it
            reads as a continuation of section 8 ("How to control
            cookies"). */}
        <section className="mt-12 border-l-2 border-oxblood pl-5 py-2">
          <p className="text-[11px] tracking-[0.20em] uppercase text-oxblood">
            Reset your cookie banner
          </p>
          <p className="mt-3 text-[14px] leading-[1.6] text-ink max-w-[58ch]">
            If you&rsquo;d like to see the cookie banner again — for example,
            to review the disclosure — clear your acknowledgment below. The
            page will reload and the banner will reappear.
          </p>
          <div className="mt-5">
            <CookieSettingsLink
              className="
                inline-flex items-center min-h-[40px] px-5
                bg-cream text-oxblood border border-oxblood
                text-[13px] tracking-[0.01em] font-medium
                transition-colors duration-200 ease-out
                hover:bg-oxblood hover:text-cream
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
              "
            />
          </div>
        </section>

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
