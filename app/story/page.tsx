import type { Metadata } from "next";
import Link from "next/link";
import { EditorialMarkdown } from "@/components/EditorialMarkdown";
import { FeedbackTrigger } from "@/components/FeedbackTrigger";

export const metadata: Metadata = {
  title: "Why RuneShips exists",
  description:
    "The experience loop, our bet on demonstrable skill, and what this platform is and isn't.",
};

// Body splits in two so the founder reminder + final feedback inset
// can be embedded between markdown blocks without forcing them into
// markdown (they're React components, not text).
const STORY_BODY_TOP = `
You need experience to get experience. Most internships require experience. Most experience requires an internship. Most opportunities require a credential the candidate doesn't yet have, gated by the very system that's supposed to grant it.

This particularly hurts freshmen and sophomores — students with no track record yet, locked out of formative opportunities by a system that selects for opportunities already had.

RuneShips exists to break that loop.

## What we tried before

There have been attempts.

**Résumé optimization** — Better keywords, ATS tricks, cleaner formatting. Doesn't fix the problem; it just helps you compete for the same scarce slots.

**Networking events** — Useful, but they reproduce the network you already have. They reward extroversion and proximity to existing opportunity, not skill.

**Project portfolios** — Closer to the right idea, but most students don't know what to build, and what they do build isn't comparable across people.

**Coding challenge platforms** — They work for software roles. They don't work for strategy, design, communication, or creativity.

**Case competitions** — Too rare, too curated, too tied to specific schools.

The common failure: none of these produce a portable, comparable signal of skill that operates outside the credential system.

## The RuneShips bet

We think skill is demonstrable. If you can do strategic thinking, you can write a strategic recommendation. If you can communicate, you can write a clear memo. If you can build, you can ship something. The work itself is the proof.

So we ask companies to post real tasks. We let any student attempt them, regardless of where they go to school or what year they're in. We score the work across five dimensions using AI feedback that's calibrated, specific, and immediate. We aggregate scores into a portable ranking that travels with the student, visible to recruiters hiring for early-career roles.

The student gets feedback faster than they'd get from a TA. The recruiter gets signal tied to actual work, not GPA or school name. The company that posted the task gets a stream of attempts from students they might otherwise never see.

## What this is

A skill assessment platform. A practice surface. A portable transcript for work you've actually done.

## What this isn't

A job placement service. A guarantee of any specific role or outcome. A replacement for relationships, mentorship, or in-person learning. A credential that supersedes degrees or experience — it's adjacent to those, not replacement for them.

If you complete tasks here and rank well, you've shown you can do those specific tasks. That's it. That's also more than most students can show at this point in their journey.

## Where we are

RuneShips is early. We're testing whether AI feedback can be calibrated enough to trust, whether students will find the feedback genuinely useful, whether companies will post tasks that matter, whether recruiters will use the rankings.

We don't know yet. We're going to find out by doing it.

**If you're a student** — Try a task. See what the feedback looks like. Tell us if it's useful.

**If you're a company** — Post a task. See what students do with it. Tell us if the work is good.

**If you're a recruiter** — Tell us what signal you'd actually use, what you wouldn't trust, what we'd need to prove.

## A note from the founder
`.trim();

const STORY_BODY_FOUNDER = `
I'm Diego. I noticed that students around me with capability and ambition were running into closed doors because they couldn't prove what they could do. I'm building RuneShips to give them a door to walk through.

There's no point pretending I have all the answers. I have a thesis, a working platform, and a willingness to be wrong about pieces of it. Send me feedback. Tell me what's broken. The early users shape what this becomes.
`.trim();

export default function StoryPage() {
  return (
    <main className="px-6 sm:px-10 md:px-16 pt-28 sm:pt-36 md:pt-44 pb-24 sm:pb-32">
      <article className="mx-auto max-w-[680px]">
        <p className="text-[12px] tracking-[0.16em] uppercase text-muted">
          Story
        </p>
        <h1
          className="mt-5 font-display font-light tracking-[-0.022em] leading-[1.02] text-ink"
          style={{
            fontSize: "var(--text-display)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          The experience loop.
        </h1>

        <EditorialMarkdown content={STORY_BODY_TOP} className="mt-10" />

        {/* Reminder to Diego — visible inset so the draft below
            doesn't ship as a final voice without a pass. */}
        <div className="mt-6 pl-6 sm:pl-8 border-l-2 border-oxblood/60 max-w-[60ch]">
          <p className="font-display italic text-[14px] leading-[1.6] text-oxblood">
            Diego — rewrite this section in your own voice before
            publishing. The draft below is a starting point, but this is
            the page where your actual voice matters most. Edit freely.
          </p>
        </div>

        <EditorialMarkdown content={STORY_BODY_FOUNDER} className="mt-6" />

        {/* Feedback inset */}
        <div className="mt-14 pl-6 sm:pl-8 border-l-2 border-oxblood/60 max-w-[60ch]">
          <p className="font-display italic text-[16px] leading-[1.6] text-ink/85">
            Want to shape what RuneShips becomes? <FeedbackTrigger />
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
