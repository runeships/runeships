import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackTrigger } from "@/components/FeedbackTrigger";

export const metadata: Metadata = {
  title: "Why RuneShips exists",
  description:
    "The experience loop, our bet on demonstrable skill, and what this platform is and isn't.",
};

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

        <Lede>
          <p>
            You need experience to get experience. Most internships require
            experience. Most experience requires an internship. Most
            opportunities require a credential the candidate doesn&rsquo;t
            yet have, gated by the very system that&rsquo;s supposed to
            grant it.
          </p>
          <p>
            This particularly hurts freshmen and sophomores — students with
            no track record yet, locked out of formative opportunities by a
            system that selects for opportunities already had.
          </p>
          <p className="text-ink">RuneShips exists to break that loop.</p>
        </Lede>

        <Section title="What we tried before">
          <p>There have been attempts.</p>
          <DefinitionList>
            <DefItem term="Résumé optimization">
              Better keywords, ATS tricks, cleaner formatting. Doesn&rsquo;t
              fix the problem; it just helps you compete for the same
              scarce slots.
            </DefItem>
            <DefItem term="Networking events">
              Useful, but they reproduce the network you already have. They
              reward extroversion and proximity to existing opportunity,
              not skill.
            </DefItem>
            <DefItem term="Project portfolios">
              Closer to the right idea, but most students don&rsquo;t know
              what to build, and what they do build isn&rsquo;t comparable
              across people.
            </DefItem>
            <DefItem term="Coding challenge platforms">
              They work for software roles. They don&rsquo;t work for
              strategy, design, communication, or creativity.
            </DefItem>
            <DefItem term="Case competitions">
              Too rare, too curated, too tied to specific schools.
            </DefItem>
          </DefinitionList>
          <p>
            The common failure: none of these produce a portable,
            comparable signal of skill that operates outside the credential
            system.
          </p>
        </Section>

        <Section title="The RuneShips bet">
          <p>
            We think skill is demonstrable. If you can do strategic
            thinking, you can write a strategic recommendation. If you can
            communicate, you can write a clear memo. If you can build, you
            can ship something. The work itself is the proof.
          </p>
          <p>
            So we ask companies to post real tasks. We let any student
            attempt them, regardless of where they go to school or what
            year they&rsquo;re in. We score the work across five dimensions
            using AI feedback that&rsquo;s calibrated, specific, and
            immediate. We aggregate scores into a portable ranking that
            travels with the student, visible to recruiters hiring for
            early-career roles.
          </p>
          <p>
            The student gets feedback faster than they&rsquo;d get from a
            TA. The recruiter gets signal tied to actual work, not GPA or
            school name. The company that posted the task gets a stream of
            attempts from students they might otherwise never see.
          </p>
        </Section>

        <Section title="What this is">
          <p>
            A skill assessment platform. A practice surface. A portable
            transcript for work you&rsquo;ve actually done.
          </p>
        </Section>

        <Section title="What this isn’t">
          <p>
            A job placement service. A guarantee of any specific role or
            outcome. A replacement for relationships, mentorship, or
            in-person learning. A credential that supersedes degrees or
            experience — it&rsquo;s adjacent to those, not replacement for
            them.
          </p>
          <p>
            If you complete tasks here and rank well, you&rsquo;ve shown
            you can do those specific tasks. That&rsquo;s it. That&rsquo;s
            also more than most students can show at this point in their
            journey.
          </p>
        </Section>

        <Section title="Where we are">
          <p>
            RuneShips is early. We&rsquo;re testing whether AI feedback can
            be calibrated enough to trust, whether students will find the
            feedback genuinely useful, whether companies will post tasks
            that matter, whether recruiters will use the rankings.
          </p>
          <p>
            We don&rsquo;t know yet. We&rsquo;re going to find out by doing
            it.
          </p>
          <DefinitionList>
            <DefItem term="If you’re a student">
              Try a task. See what the feedback looks like. Tell us if
              it&rsquo;s useful.
            </DefItem>
            <DefItem term="If you’re a company">
              Post a task. See what students do with it. Tell us if the
              work is good.
            </DefItem>
            <DefItem term="If you’re a recruiter">
              Tell us what signal you&rsquo;d actually use, what you
              wouldn&rsquo;t trust, what we&rsquo;d need to prove.
            </DefItem>
          </DefinitionList>
        </Section>

        <Section title="A note from the founder">
          {/* Reminder to Diego — visible inset so the draft below
              doesn't ship as a final voice without a pass. */}
          <div className="pl-6 sm:pl-8 border-l-2 border-oxblood/60 max-w-[60ch]">
            <p className="font-display italic text-[14px] leading-[1.6] text-oxblood">
              Diego — rewrite this section in your own voice before
              publishing. The draft below is a starting point, but this is
              the page where your actual voice matters most. Edit freely.
            </p>
          </div>
          <p>
            I&rsquo;m Diego. I noticed that students around me with
            capability and ambition were running into closed doors because
            they couldn&rsquo;t prove what they could do. I&rsquo;m
            building RuneShips to give them a door to walk through.
          </p>
          <p>
            There&rsquo;s no point pretending I have all the answers. I
            have a thesis, a working platform, and a willingness to be
            wrong about pieces of it. Send me feedback. Tell me what&rsquo;s
            broken. The early users shape what this becomes.
          </p>
        </Section>

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

/* ─── Editorial helpers ─────────────────────────────────────────── */

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 prose-editorial text-[18px] sm:text-[19px] leading-[1.65] text-ink/85 space-y-5">
      {children}
    </div>
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
      <div className="mt-6 prose-editorial text-[16px] sm:text-[17px] leading-[1.7] text-ink/85 space-y-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-[1.65]">
        {children}
      </div>
    </section>
  );
}

function DefinitionList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-5">{children}</div>;
}

function DefItem({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <strong className="text-oxblood font-semibold">{term}</strong>
      {" — "}
      {children}
    </p>
  );
}
