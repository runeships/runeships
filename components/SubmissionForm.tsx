"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  submitTask,
  type SubmitTaskState,
} from "@/app/actions/submitTask";
import type { SubmissionMode } from "@/lib/database.types";

const initial: SubmitTaskState = { status: "idle" };

type SubmissionFormProps = {
  taskId: string;
  submissionMode: SubmissionMode;
};

/**
 * The submission form for a single task. Fields shown depend on the
 * task's submission_mode. Server action submitTask handles validation,
 * cooldown enforcement, and DB insert. Success replaces the form with
 * an editorial confirmation panel linking to the new submission.
 */
export function SubmissionForm({
  taskId,
  submissionMode,
}: SubmissionFormProps) {
  const [state, formAction, pending] = useActionState(submitTask, initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [linkConfirmed, setLinkConfirmed] = useState(false);

  const needsText =
    submissionMode === "text_only" || submissionMode === "text_and_link";
  const needsLink =
    submissionMode === "link_only" || submissionMode === "text_and_link";

  const canSubmit =
    title.trim().length > 0 &&
    (!needsText || body.trim().length > 0) &&
    (!needsLink || (link.trim().length > 0 && linkConfirmed)) &&
    !pending;

  if (state.status === "success") {
    const ready = state.feedbackGenerated;
    const human = state.awaitingHumanReview;
    const companyName = state.companyName ?? null;

    // Three success variants:
    //   - human review: task's AI budget exhausted → manual review queue
    //   - AI feedback ready: scores are live
    //   - AI feedback failed: stays put, retry available on detail page
    const kicker = human
      ? "Submission received"
      : ready
      ? "Feedback ready"
      : "Submission received";
    const headline = human
      ? "Your submission is in the human review queue."
      : ready
      ? "Your scores are in."
      : "Your work has been saved.";
    const body = human
      ? `This task's automated grading capacity has been reached for the period — your submission is in the human review queue and will be graded within a couple of hours.${companyName ? ` ${companyName} has been notified.` : ""} You'll get an email when your feedback is ready.`
      : ready
      ? "Per-dimension scores and written feedback are on the submission page."
      : "Feedback generation hit a snag — you can retry from the submission page.";
    const linkLabel = human
      ? "View your submission"
      : ready
      ? "View it"
      : "View your submission";

    return (
      <div className="pl-6 sm:pl-8 border-l-2 border-oxblood max-w-[60ch] mx-auto">
        <p className="text-[11px] tracking-[0.18em] uppercase text-oxblood">
          {kicker}
        </p>
        <p className="mt-4 font-display font-light text-[26px] sm:text-[30px] leading-[1.15] tracking-[-0.014em] text-ink">
          {headline}
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] text-ink/85">{body}</p>
        <Link
          href={`/submissions/${state.submissionId}`}
          className="
            mt-7 inline-flex items-center gap-1.5
            link-anim text-ink hover:text-oxblood
            transition-colors duration-200 ease-out
            text-[15px] tracking-[0.005em]
          "
        >
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-8 max-w-[680px] mx-auto">
      <input type="hidden" name="task_id" value={taskId} />

      {/* Honest expectations + compliance note before the inputs. */}
      <div className="border-l-2 border-ink/20 pl-5 max-w-[60ch] text-[12px] leading-[1.6] text-muted">
        <p>
          <span className="text-ink">Submit work you&rsquo;ve done for the
          task.</span> RuneShips isn&rsquo;t a homework grader or a general
          AI essay reviewer — off-topic submissions (papers from a different
          course, generic requests for feedback, attempts to use the AI for
          something else) score near zero and may be removed.
        </p>
        <p className="mt-2">
          Don&rsquo;t include identifying information about real third
          parties (real co-workers, real clients, real companies you&rsquo;re
          not the task is about) in your submission text. If your work
          involves real-world examples, keep names and details generic.
        </p>
      </div>

      {/* Title — always required */}
      <div>
        <FieldLabel htmlFor="sub-title">Title of your submission</FieldLabel>
        <input
          id="sub-title"
          name="submission_title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={pending}
          placeholder="e.g., Pitch deck for Atlas — Series A"
          className="
            w-full min-h-[52px] px-4
            border border-ink/25 bg-cream text-ink placeholder:text-muted/80
            text-[15px] tracking-[-0.005em]
            outline-none
            transition-colors duration-150 ease-out
            focus:border-oxblood focus:ring-1 focus:ring-oxblood
            disabled:opacity-60
          "
        />
      </div>

      {/* Body — text_only / text_and_link */}
      {needsText && (
        <div>
          <FieldLabel htmlFor="sub-body">Your work</FieldLabel>
          <textarea
            id="sub-body"
            name="submission_body"
            rows={12}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
            placeholder="Paste or write your submission here. Use clear structure — headings, paragraphs."
            className="
              w-full px-4 py-3
              border border-ink/25 bg-cream text-ink placeholder:text-muted/80
              text-[15px] leading-[1.65] tracking-[-0.005em]
              outline-none resize-y
              transition-colors duration-150 ease-out
              focus:border-oxblood focus:ring-1 focus:ring-oxblood
              disabled:opacity-60
            "
          />
        </div>
      )}

      {/* Link — link_only / text_and_link */}
      {needsLink && (
        <div>
          <FieldLabel htmlFor="sub-link">Supporting link</FieldLabel>
          <input
            id="sub-link"
            name="supporting_link"
            type="url"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={pending}
            placeholder="https://docs.google.com/… or https://github.com/…"
            className="
              w-full min-h-[52px] px-4
              border border-ink/25 bg-cream text-ink placeholder:text-muted/80
              text-[15px] tracking-[-0.005em]
              outline-none
              transition-colors duration-150 ease-out
              focus:border-oxblood focus:ring-1 focus:ring-oxblood
              disabled:opacity-60
            "
          />
          <label className="mt-4 flex items-start gap-3 cursor-pointer text-[14px] leading-[1.5] text-ink/85 select-none">
            <input
              type="checkbox"
              name="link_access_confirmed"
              checked={linkConfirmed}
              onChange={(e) => setLinkConfirmed(e.target.checked)}
              disabled={pending}
              className="mt-[3px] w-4 h-4 accent-oxblood cursor-pointer disabled:cursor-not-allowed"
              style={{ accentColor: "var(--color-oxblood)" }}
            />
            <span>
              I confirm this link is viewable by anyone with the link.
            </span>
          </label>
        </div>
      )}

      {state.status === "error" && (
        <p
          role="alert"
          className="text-[14px] leading-[1.5] text-oxblood max-w-[58ch]"
        >
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={pending}
          className={`
            inline-flex items-center
            min-h-[56px] px-9
            bg-oxblood text-cream
            border border-oxblood
            text-[15px] tracking-[0.01em] font-medium
            transition-colors duration-200 ease-out
            hover:bg-oxblood-hover focus-visible:bg-oxblood-hover
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oxblood
            disabled:opacity-50 disabled:cursor-not-allowed
            ${pending ? "btn-pulse" : ""}
          `}
        >
          {pending ? "Generating feedback…" : "Submit your work"}
        </button>
        {pending && (
          <p className="mt-3 text-[13px] leading-[1.5] text-muted max-w-[58ch]">
            We&rsquo;re scoring your work across five dimensions. This usually
            takes 30–60 seconds — hang on.
          </p>
        )}
      </div>
    </form>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] tracking-[0.18em] uppercase text-muted mb-2.5"
    >
      {children}
    </label>
  );
}
