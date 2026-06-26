import {
  type Dimension,
  dimensionLabel,
  hypotheticalPercentile,
} from "@/lib/rankings";
import { createAdminClient } from "@/lib/supabase-admin";

type FeedbackScores = {
  score_strategy: number;
  score_execution: number;
  score_communication: number;
  score_technical: number;
  score_creativity: number;
};

const DIMENSIONS: Dimension[] = [
  "strategy",
  "execution",
  "communication",
  "technical",
  "creativity",
];

const SCORE_KEY: Record<Dimension, keyof FeedbackScores> = {
  strategy: "score_strategy",
  execution: "score_execution",
  communication: "score_communication",
  technical: "score_technical",
  creativity: "score_creativity",
};

/**
 * "In context" sentence below the score panel on /submissions/[id].
 * Server component — runs the rankings + best-on-this-task lookup
 * inline. Returns null entirely when the user has fewer than 3
 * submissions (not enough trajectory data per spec).
 */
export async function SubmissionContext({
  userId,
  submissionId,
  taskId,
  feedback,
}: {
  userId: string;
  submissionId: string;
  taskId: string;
  feedback: FeedbackScores;
}) {
  const admin = createAdminClient();

  // Total submissions threshold — fewer than 3 = skip.
  const { count } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) < 3) return null;

  // Strongest dimension on THIS submission specifically.
  const strongestHere = DIMENSIONS.reduce((best, d) =>
    feedback[SCORE_KEY[d]] > feedback[SCORE_KEY[best]] ? d : best,
  );
  const strongestScore = feedback[SCORE_KEY[strongestHere]];

  // Where this submission's score on the strongest dim would rank
  // in the cohort, treated as if it were the user's aggregate.
  const counterfactualPercentile = await hypotheticalPercentile(
    userId,
    strongestHere,
    strongestScore,
  );

  // Is this submission a new peak on this dim for this task?
  // Compare to other submissions on the same task by the same user.
  const { data: otherFeedback } = await admin
    .from("feedback")
    .select(
      `score_strategy, score_execution, score_communication, score_technical, score_creativity, submission_id, submissions!inner(user_id, task_id)`,
    );
  // PostgREST inner-join filter wasn't typed cleanly for our schema —
  // do it in JS instead, then narrow on user+task.
  const taskScoresForUser = (otherFeedback ?? [])
    .filter((row) => {
      const sub = Array.isArray(row.submissions)
        ? row.submissions[0]
        : row.submissions;
      return (
        sub &&
        sub.user_id === userId &&
        sub.task_id === taskId &&
        row.submission_id !== submissionId
      );
    })
    .map((row) => row[SCORE_KEY[strongestHere]] as number);

  const previousBest =
    taskScoresForUser.length > 0 ? Math.max(...taskScoresForUser) : -1;
  const isNewPeakOnTask = strongestScore > previousBest;

  const dimName = dimensionLabel(strongestHere);
  const rankClause =
    counterfactualPercentile !== null
      ? ` It would rank in the top ${Math.max(0, 100 - counterfactualPercentile)}% on ${dimName} overall.`
      : "";
  const peakClause = isNewPeakOnTask
    ? ", and it's now your new peak score on this dimension."
    : "";

  return (
    <div className="mt-10 sm:mt-12 mx-auto max-w-[680px]">
      <p className="font-display italic text-[17px] leading-[1.7] text-muted">
        This was your {dimName.toLowerCase()} submission.
        {rankClause}
        {peakClause}
      </p>
    </div>
  );
}
