import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "Privacy · RuneShips",
  description: "Privacy policy for RuneShips.",
};

const EFFECTIVE_DATE = "June 14, 2026";
const LAST_UPDATED = "June 14, 2026";

const PRIVACY_BODY = `
## 1. Who we are

RuneShips is an independent online project ("RuneShips," "we," "us," or "our") that operates the platform at runeships.com. The platform is run by its founder as a personal project. You can reach us at any time at [hello@runeships.com](mailto:hello@runeships.com).

When this policy says "you" or "your," we mean the person using the platform, whether as a student or as a representative of a company that posts tasks.

## 2. Scope of this policy

This policy describes what personal information RuneShips collects, how we use it, who we share it with, and the rights you have over your data. It applies to everyone who uses runeships.com or any associated services.

This policy does not cover third-party websites you may reach through links on our platform. Those services have their own privacy practices.

## 3. The information we collect

We collect only the information needed to run the platform.

**Information you provide when creating an account:**

- Email address
- Name
- School / university
- Expected graduation year
- Whether you are signing up as a student or as a company

**Information you provide as a student during onboarding:**

- Career interests / career tracks
- Self-rated skill levels across the five RuneShips dimensions
- Optional fields such as preferred specific skills

**Information you provide as a company during onboarding:**

- Company name
- Industry, company size, website (all optional)
- Types of tasks you typically post (optional)

**Information you provide through use of the platform:**

- Submissions you create (text, files, or links you upload to complete tasks)
- Tasks you post (if you are a company)
- Files you attach to tasks
- Feedback you give us through forms

**Information generated automatically:**

- AI-generated feedback and per-dimension scores on your submissions
- Aggregated rankings derived from your scores
- Standard server logs (IP address, browser type, page paths, timestamps) used for security, debugging, and abuse prevention
- Authentication session cookies (necessary to keep you signed in)

**Information from third parties:**

- We do not buy or receive personal information about you from data brokers, social networks, or advertisers.

## 4. Legal basis for processing (for users in the EU, UK, and similar jurisdictions)

For users protected by GDPR, UK GDPR, or similar frameworks, we process your data under the following legal bases:

- **Performance of a contract:** Account information, submissions, AI feedback, and ranking calculations are necessary to provide the service you signed up for.
- **Consent:** Optional fields (self-rated skills, career interests, notification preferences, recruiter visibility opt-in) are processed only with your consent. You can withdraw consent at any time.
- **Legitimate interest:** Server logs, security monitoring, and platform analytics in aggregate form are processed under our legitimate interest in maintaining a secure and functional service. We have balanced this against your interests.
- **Legal obligation:** In rare cases, we may process or retain data to comply with applicable laws.

## 5. How we use your information

We use the information described above for the following purposes:

- To create and maintain your account
- To generate personalized AI feedback and scores on your submissions
- To compute your standing within the RuneShips cohort
- To enable companies you post tasks for to see and rank student submissions to their tasks
- To send transactional emails (account confirmation, magic-link sign-in, feedback ready notifications, new task notifications you opt into)
- To diagnose technical issues, detect abuse, and improve the platform
- To respond to your inquiries when you contact us
- To make your skill profile available to recruiters only if you explicitly opt in (this feature is in development; we will ask before activating any recruiter visibility)

We do not use your information for advertising. We do not sell, rent, or trade your personal information to third parties for their own marketing purposes, ever.

## 6. Automated decision-making and AI

RuneShips uses artificial intelligence to score your submissions across five dimensions (Strategy, Execution, Communication, Technical, Creativity) and to generate qualitative feedback. These scores are derived automatically using third-party AI models, primarily Anthropic's Claude family of models.

These scores do not produce legal or significant effects on you in the sense of Article 22 of the GDPR. They are advisory feedback intended to help you understand your work. They do not by themselves grant, deny, or determine any educational, financial, or employment outcome.

However, we want you to have meaningful transparency and control over how AI evaluates your work. Therefore:

- You can request human review of any AI-generated score by emailing [hello@runeships.com](mailto:hello@runeships.com). We will arrange for a person to re-evaluate the submission.
- You can contest the score and provide context for why you believe it is inaccurate.
- You can delete the submission at any time, which removes the associated score from your profile and rankings.
- Where required by law, you have the right to ask for an explanation of how the score was generated. We will provide a meaningful explanation of the factors used.

## 7. Who we share your information with

We share data only with the third-party providers necessary to run the platform. Each of these is bound by their own data protection commitments and applicable contractual safeguards:

- **Supabase**, our database and authentication provider. Stores account data, profile information, submissions, and feedback.
- **Anthropic**, which provides the AI models that generate scores and feedback. Receives the text content of submissions to generate evaluations.
- **Resend**, which sends transactional emails on our behalf.
- **Vercel**, which hosts the platform and provides analytics (in aggregate, non-identifying form).

We do not sell your personal information. We do not share it with advertisers, data brokers, or any party not listed above.

We may disclose your information if legally required to do so (for example, in response to a valid subpoena or court order), or if necessary to investigate violations of our Terms or to protect the rights, safety, or property of RuneShips, our users, or others.

## 8. International data transfers

RuneShips primarily processes and stores data on infrastructure located in the United States. If you are accessing the platform from the European Economic Area, the United Kingdom, Switzerland, or another jurisdiction with cross-border data transfer rules, please be aware that your data will be transferred to, and processed in, the United States.

Our sub-processors (Supabase, Anthropic, Resend, Vercel) primarily operate in the United States. Where applicable, transfers to these processors are governed by:

- The European Commission's Standard Contractual Clauses for transfers from the EEA
- The UK's International Data Transfer Addendum for transfers from the UK
- Equivalent mechanisms for transfers from Switzerland and other jurisdictions

By using the platform, users in these regions consent to these transfers under the safeguards described above.

## 9. How long we keep your data

We keep your data only as long as needed to provide the service or comply with our legal obligations.

- **Account data, profile, and submissions:** retained for as long as your account is active.
- **After you delete your account:** we delete the bulk of your data within 30 days. Some limited records may be retained longer where required (e.g., transaction records for fraud prevention, server logs, or where retention is necessary to comply with applicable law).
- **Server logs:** retained for up to 12 months for security, debugging, and abuse prevention purposes, then deleted or aggregated to non-identifying form.
- **Backups:** standard system backups may include copies of your data for up to 90 days after deletion, after which backup copies are also purged.

You can delete your account at any time from [/profile?tab=account](/profile?tab=account), or by emailing us.

## 10. Your rights

You have rights over your personal information. The specific rights you have depend on where you are.

**If you are in the United States** (and where applicable under state law such as California's CCPA/CPRA, Virginia's VCDPA, Colorado, Connecticut, or other state laws):

- Right to know what personal information we have about you.
- Right to delete your personal information, subject to legal exceptions.
- Right to correct inaccurate personal information.
- Right to opt out of sale or sharing of your personal information (we do not sell or share for advertising; this right is moot but you have it).
- Right to non-discrimination for exercising these rights.
- Right to limit use of sensitive personal information (we do not use sensitive personal information beyond what is necessary for the service).

**If you are in the European Economic Area, the United Kingdom, or Switzerland:**

- Right of access to the personal data we hold about you.
- Right to rectification of inaccurate or incomplete data.
- Right to erasure ("right to be forgotten").
- Right to restriction of processing.
- Right to data portability: receiving your data in a structured, machine-readable format.
- Right to object to processing based on legitimate interest.
- Right to withdraw consent at any time for processing based on consent.
- Right to lodge a complaint with your local supervisory authority. In Spain this is the Agencia Española de Protección de Datos (AEPD, [www.aepd.es](https://www.aepd.es)). In the UK, the Information Commissioner's Office (ICO). Other EU residents may contact their national authority.

To exercise any of these rights, email [hello@runeships.com](mailto:hello@runeships.com). We will respond within 30 days. We may need to verify your identity before fulfilling certain requests.

## 11. Users under 16

RuneShips is intended for users aged 16 and older.

We do not knowingly collect personal information from anyone under 16. If you are a parent or guardian and believe we have collected information from your child, please contact us at [hello@runeships.com](mailto:hello@runeships.com) and we will delete it promptly.

If we learn that an account belongs to someone under 16, we will close the account and delete the associated data.

For users between 16 and 18 who are nonetheless using the platform, we recommend involving a parent or guardian when sharing personal information online.

## 12. Cookies and similar technologies

RuneShips uses a small number of essential cookies (authentication, security, site preferences) to make the platform work. We do not use advertising or third-party tracking cookies. Vercel provides aggregate analytics about platform usage that does not identify individual users.

For full details on the cookies we use, see our [Cookies Policy](/cookies).

## 13. Security

We protect your data using standard security practices: encrypted data transmission over HTTPS, encrypted-at-rest storage via Supabase, access controls, and routine security review of our infrastructure providers.

No system is perfectly secure. If we become aware of a security incident affecting your data, we will notify you in accordance with applicable law.

## 14. Changes to this policy

We may update this policy from time to time. Material changes will be posted at runeships.com/privacy with an updated "Last updated" date, and we will notify active users by email at least 14 days before significant changes take effect.

Continued use of the platform after changes take effect constitutes acceptance of the updated policy.

## 15. Contact

For privacy-related questions, requests, or complaints, contact us at:

Email: [hello@runeships.com](mailto:hello@runeships.com)

We aim to respond to all inquiries within 14 days, and to all formal data-rights requests within 30 days as required by applicable law.
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

        <p className="mt-6 text-[13px] tracking-[0.04em] text-muted">
          Effective date: {EFFECTIVE_DATE}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Last updated: {LAST_UPDATED}
        </p>

        <EditorialMarkdown content={PRIVACY_BODY} className="mt-10" />

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
