import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";

export const metadata: Metadata = {
  title: "Terms of Service · RuneShips",
  description: "Terms of Service for RuneShips.",
};

const EFFECTIVE_DATE = "June 14, 2026";
const LAST_UPDATED = "June 14, 2026";

const TERMS_BODY = `
## 1. Agreement to Terms

These Terms of Service ("Terms") form a binding agreement between you and RuneShips ("RuneShips," "we," "us," or "our") governing your use of the platform at runeships.com and any related services (the "Platform"). By creating an account, signing in, or otherwise using the Platform, you agree to these Terms and to our [Privacy Policy](/privacy) and [Cookies Policy](/cookies).

If you do not agree to these Terms, do not use the Platform.

## 2. Eligibility

You must be at least **16 years old** to use the Platform. If you are between 16 and the age of majority in your jurisdiction, you represent that a parent or guardian has reviewed these Terms with you.

If you are using the Platform on behalf of a company or other organization, you represent that you have authority to bind that entity, and "you" in these Terms refers to both you individually and that entity.

You may not use the Platform if you are barred from doing so under the laws of the United States, your country of residence, or any other applicable jurisdiction.

## 3. Accounts

You create an account by providing an email address and authenticating via the magic-link flow. You are responsible for:

- Keeping your sign-in email secure
- Activity that occurs under your account
- Promptly notifying us if you suspect unauthorized access ([hello@runeships.com](mailto:hello@runeships.com))

You may delete your account at any time from [/profile?tab=account](/profile?tab=account). We may suspend or terminate accounts under Section 11.

## 4. Description of the Service

RuneShips is a skill-assessment platform. Students complete tasks posted by companies and receive AI-generated feedback and scores across five dimensions (Strategy, Execution, Communication, Technical, Creativity). Companies post tasks and view submissions that the RuneShips team has released to them.

The Platform is provided "as available." Features may change, be added, or be removed at our discretion. We make no guarantee that any specific task, company, or evaluator will be present at any given time.

## 5. User Content and Licenses

"User Content" means anything you submit to the Platform: task submissions, files, links, briefs, profile information, comments, and any other material.

### 5.1 You retain ownership

You retain all ownership of your User Content. Nothing in these Terms transfers ownership of your work to us.

### 5.2 Narrow license to operate the Platform

You grant RuneShips a non-exclusive, worldwide, royalty-free license to host, store, reproduce, process, display, and transmit your User Content **solely for the purpose of operating the Platform and providing the service to you**. This includes:

- Storing your submissions and feedback in our database
- Transmitting submission content to our AI provider (Anthropic) for scoring
- Displaying submissions to the company that posted the task, once released
- Showing your aggregate scores to you and on the verification page if you have generated a resume code

This license ends when you delete the relevant content, subject to retention obligations described in our Privacy Policy.

### 5.3 No marketing use of student work without consent

**RuneShips will not use your User Content for marketing, advertising, promotional materials, case studies, blog posts, social media, or any external publicity without your explicit prior written consent.** If we want to feature your work, we will ask, and you can decline without affecting your account.

### 5.4 Companies and their tasks

Companies that post tasks grant RuneShips and Platform users a license to display task briefs and any attached files for the purpose of letting students complete the task. Companies may not use student submissions outside the Platform without the student's explicit prior consent, unless they have engaged in a separate written agreement with the student.

## 6. AI-Generated Feedback and Scores

Submissions are scored automatically by third-party AI models (primarily Anthropic's Claude family). These scores and the accompanying qualitative feedback are **advisory**. They are intended to help you understand your work and your standing on the Platform.

You acknowledge that:

- AI feedback can be wrong, biased, incomplete, or inconsistent
- Scores do not guarantee any educational, financial, employment, or other outcome
- The Platform does not constitute career advice, academic certification, or a credential recognized by any third party
- You may request human review of any AI-generated score by emailing [hello@runeships.com](mailto:hello@runeships.com)

For users in jurisdictions that grant rights against automated decision-making (e.g., GDPR Article 22), see Section 6 of our [Privacy Policy](/privacy) for the additional rights you have.

## 7. Acceptable Use

You agree not to use the Platform to:

- Violate any applicable law, regulation, or third-party right
- Submit material you don't have the right to share, including infringing, defamatory, or obscene material
- Submit malware, viruses, or destructive code
- Misrepresent your identity, your affiliations, or whose work a submission represents (no impersonation; no submitting someone else's work as your own)
- Manipulate scores, rankings, or any other Platform metric (no creating fake accounts, no coordinated voting, no automated submission generation)
- Scrape, crawl, or systematically extract data from the Platform without our written permission
- Probe, scan, or test the vulnerability of the Platform, or interfere with security features
- Reverse-engineer the AI prompts, scoring weights, or grading rubrics
- Use the Platform to harass, threaten, or harm any other person
- Use the Platform to send unsolicited communications
- Use the Platform if you are a competitor, for the purpose of building or improving a competitive product
- Resell, sublicense, or commercially redistribute any portion of the Platform without our prior written agreement

Violations may result in suspension or termination of your account, removal of content, and, where appropriate, referral to law enforcement.

## 8. Company Users: Additional Terms

If you are using the Platform as a representative of a company posting tasks, you additionally agree:

- Tasks you post must reflect real work or realistic exercises, not assessment-only puzzles designed to identify candidates without any benefit to them
- You will not use the Platform to source labor without compensation when the work product has commercial value to you. Genuine practice tasks and timed assessments are permitted; production work disguised as a "task" is not.
- You will not contact students outside the Platform for recruiting purposes without their explicit invitation
- You will pay any fees that apply (currently, the Platform is free; if this changes, you will be notified before fees apply to you)

## 9. Verification Codes and Resume Features

The Platform may issue you a public verification code (e.g., \`runeships.com/v/{code}\`) that you can include on a CV or share with recruiters. You agree that:

- The verification page reflects your **current** standing, not a frozen snapshot; your percentile may change as the cohort grows or as you complete more tasks
- You will not represent the verification page as anything other than what it is: a real-time skill-assessment profile within the RuneShips Platform
- Misrepresenting your RuneShips standing in any formal document (resume, application, etc.) violates these Terms and may result in account termination

## 10. Fees

The Platform is currently free to use for both students and companies. We reserve the right to introduce paid features in the future. If we do, fees will only apply to features you specifically opt into, and we will give you advance notice and an opportunity to opt out before any charge is incurred.

## 11. Termination

You may stop using the Platform at any time. You may delete your account from [/profile?tab=account](/profile?tab=account) or by emailing us.

We may suspend or terminate your account, with or without notice, if we reasonably believe you have violated these Terms, if continued provision of the service to you would expose us to legal risk, or if the Platform itself is being discontinued.

On termination:

- Your access to the Platform ends
- Your User Content is deleted under the retention schedule in our [Privacy Policy](/privacy)
- Sections that by their nature should survive termination (including Sections 5 (licenses already exercised), 13, 14, 15, 17, 18) will survive

## 12. Intellectual Property

The Platform, including its design, code, branding, copy, AI prompts, scoring rubrics, and the verification system, is owned by RuneShips and is protected by copyright, trademark, and other intellectual property laws. No portion of the Platform may be copied, reverse-engineered, or commercially exploited without our prior written agreement.

The "RuneShips" name, the longship and rune marks, and the editorial visual system are trademarks of RuneShips. You may not use them in a way that suggests endorsement, partnership, or sponsorship unless we have agreed to that use in writing.

Nothing in these Terms grants you any rights in our intellectual property beyond the right to use the Platform under these Terms.

## 13. Disclaimers

THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, RUNESHIPS DISCLAIMS ALL WARRANTIES, INCLUDING WITHOUT LIMITATION:

- ANY IMPLIED WARRANTY OF MERCHANTABILITY
- ANY IMPLIED WARRANTY OF FITNESS FOR A PARTICULAR PURPOSE
- ANY IMPLIED WARRANTY OF NON-INFRINGEMENT
- ANY WARRANTY ARISING FROM COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF TRADE

WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE DO NOT WARRANT THAT AI-GENERATED FEEDBACK WILL BE ACCURATE, COMPLETE, FAIR, OR FREE FROM BIAS. WE DO NOT WARRANT THAT USING THE PLATFORM WILL RESULT IN ANY EDUCATIONAL, EMPLOYMENT, OR FINANCIAL OUTCOME.

YOUR USE OF THE PLATFORM IS AT YOUR OWN RISK.

Some jurisdictions don't allow exclusion of certain warranties. In those jurisdictions, the disclaimers above apply only to the extent permitted by applicable law.

## 14. Limitation of Liability

TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:

(A) IN NO EVENT WILL RUNESHIPS, ITS FOUNDER, OR ITS PERSONNEL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES (INCLUDING WITHOUT LIMITATION LOST PROFITS, LOST DATA, LOST GOODWILL, LOST EMPLOYMENT OPPORTUNITY, OR REPUTATIONAL HARM) ARISING OUT OF OR RELATING TO YOUR USE OF, OR INABILITY TO USE, THE PLATFORM, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

(B) OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE PLATFORM OR THESE TERMS WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100), REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, STATUTE, OR OTHERWISE).

(C) THE LIMITATIONS IN THIS SECTION 14 APPLY EVEN IF A REMEDY FAILS OF ITS ESSENTIAL PURPOSE.

Some jurisdictions don't allow the exclusion or limitation of certain damages. In those jurisdictions, our liability is limited to the maximum extent permitted by applicable law.

## 15. Indemnification

You agree to indemnify, defend, and hold harmless RuneShips, its founder, and its personnel from any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:

- Your User Content
- Your use of the Platform
- Your violation of these Terms
- Your violation of any third-party right, including intellectual property, privacy, or publicity rights
- Any misrepresentation you make about your RuneShips standing on a resume, application, or other formal document

## 16. DMCA and Copyright

We respect the intellectual property rights of others and expect users to do the same. If you believe content on the Platform infringes your copyright, send a notice that meets the requirements of the Digital Millennium Copyright Act ("DMCA") to our designated agent:

**Designated DMCA Agent**
RuneShips
Email: [hello@runeships.com](mailto:hello@runeships.com) (subject line: "DMCA Notice")

A valid DMCA notice must include:

1. Your physical or electronic signature
2. Identification of the copyrighted work you claim has been infringed
3. Identification of the allegedly infringing material on the Platform, including its URL
4. Your contact information (name, address, telephone number, email)
5. A statement that you have a good-faith belief that the use is not authorized
6. A statement, under penalty of perjury, that the information in the notice is accurate and that you are authorized to act on behalf of the copyright owner

If we receive a valid notice, we will remove or disable access to the allegedly infringing material and notify the user who posted it. The user may file a counter-notification under DMCA procedures. Repeat infringers will have their accounts terminated.

## 17. Governing Law

These Terms, and any dispute arising out of or relating to them or the Platform, are governed by the laws of the State of California, U.S.A., without regard to its conflict-of-laws principles.

If you are a consumer resident in the European Economic Area, the United Kingdom, or another jurisdiction whose mandatory consumer-protection laws apply notwithstanding the foregoing, those mandatory laws will continue to apply to you.

## 18. Dispute Resolution and Arbitration

**Please read this section carefully; it affects your legal rights.**

### 18.1 Informal resolution

Before filing a formal dispute, you agree to first contact us at [hello@runeships.com](mailto:hello@runeships.com) and attempt to resolve the matter informally for 60 days.

### 18.2 Binding individual arbitration

If informal resolution fails, you and RuneShips agree to resolve any dispute arising out of or relating to these Terms, the Platform, or your use of the Platform by **binding individual arbitration administered by JAMS** under its then-current Streamlined Arbitration Rules and Procedures, available at [www.jamsadr.com](https://www.jamsadr.com).

- Arbitration will be conducted in San Francisco, California, or via remote video conference at your option.
- Judgment on the arbitrator's award may be entered in any court of competent jurisdiction.
- Either party may seek emergency injunctive relief from a court before arbitration begins to preserve the status quo.

### 18.3 Class action waiver

**YOU AND RUNESHIPS AGREE THAT DISPUTES WILL BE RESOLVED ONLY ON AN INDIVIDUAL BASIS.** Class arbitrations, class actions, private attorney-general actions, and consolidation with other arbitrations are not allowed. If a court decides that this waiver is unenforceable as to a particular claim or remedy, that claim or remedy is severed and proceeds in court; the remainder of this Section 18 continues to apply.

### 18.4 30-day opt-out

You can opt out of this arbitration agreement and the class-action waiver by emailing [hello@runeships.com](mailto:hello@runeships.com) with the subject line **"Arbitration Opt-Out"** within **30 days** of first accepting these Terms. Your message must include your account email and a clear statement that you opt out of arbitration. Opting out does not affect any other provision of these Terms.

If you've already been using the Platform longer than 30 days at the time you read this updated Terms, your 30-day window runs from the date you accept this updated version.

### 18.5 Small-claims exception

Notwithstanding Section 18.2, either party may bring an individual claim in small-claims court if it qualifies and stays in that court.

### 18.6 Governing arbitration law

The Federal Arbitration Act governs the interpretation and enforcement of this Section 18.

## 19. Changes to These Terms

We may update these Terms from time to time. Non-material changes take effect when posted at runeships.com/terms with an updated "Last updated" date. **For material changes, we will give at least 14 days' advance notice by email to active users before the changes take effect.**

Material changes include changes to dispute resolution, scope of license you grant us, fees, or limitations on liability. Continued use of the Platform after the effective date of an update constitutes acceptance of the updated Terms. If you don't agree to a material change, your remedy is to stop using the Platform and delete your account before the effective date.

## 20. General

### 20.1 Entire agreement

These Terms, together with the [Privacy Policy](/privacy) and [Cookies Policy](/cookies), constitute the entire agreement between you and RuneShips regarding the Platform and supersede any prior agreements.

### 20.2 Severability

If any provision of these Terms is held invalid or unenforceable, that provision will be enforced to the maximum extent permitted, and the remaining provisions will remain in full force.

### 20.3 No waiver

Our failure to enforce any provision is not a waiver of our right to do so later.

### 20.4 Assignment

You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, sale of assets, or by operation of law.

### 20.5 Contact

For questions about these Terms, email [hello@runeships.com](mailto:hello@runeships.com).

RuneShips is an independent project operated by Diego Marjotie.
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
          Terms of Service.
        </h1>

        <p className="mt-6 text-[13px] tracking-[0.04em] text-muted">
          Effective date: {EFFECTIVE_DATE}
          <span aria-hidden className="mx-2 text-muted/50">·</span>
          Last updated: {LAST_UPDATED}
        </p>

        <EditorialMarkdown content={TERMS_BODY} className="mt-10" />

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
