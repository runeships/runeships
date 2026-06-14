/**
 * Run the production grading prompt against reference submissions
 * to verify calibration anchors are landing where they should.
 *
 * Usage:
 *   pnpm tsx scripts/test-grader-calibration.ts
 *
 * Runs all three benchmarks: garbage, ChatGPT baseline, Toronto
 * exceptional. Prints per-dimension scores + weighted total + a
 * pass/fail against the expected range from CLAUDE.md.
 *
 * No DB writes. Counts against your Anthropic spend (~$0.015 total
 * for the three runs). Run sparingly.
 */

import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

// Next.js loads .env.local automatically at runtime, but standalone
// scripts need an explicit path — dotenv's default is .env. Try
// .env.local first, fall back to .env.
dotenv.config({ path: ".env.local" });
if (!process.env.ANTHROPIC_API_KEY) dotenv.config({ path: ".env" });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error(
    "Missing ANTHROPIC_API_KEY. Add it to .env.local at the project root.",
  );
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });
const MODEL = "claude-haiku-4-5-20251001";

type Bench = {
  name: string;
  taskBrief: string;
  submissionTitle: string;
  submissionBody: string;
  weights: { strategy: number; execution: number; communication: number; technical: number; creativity: number };
  expectedTotalRange: [number, number];
};

const STRATEGY_BRIEF = `ContextCo is a B2B SaaS company with $4.8M ARR primarily from US customers. The board is considering international expansion in 2026. Should they enter a new market? If yes, which one and how? Provide a written recommendation with reasoning, financial framing, kill thresholds, and the strongest counter-argument to your own pick.`;

const STRATEGY_WEIGHTS = {
  strategy: 0.4,
  communication: 0.3,
  execution: 0.15,
  creativity: 0.1,
  technical: 0.05,
};

const BENCHMARKS: Bench[] = [
  {
    name: "garbage",
    taskBrief: STRATEGY_BRIEF,
    submissionTitle: "submission",
    submissionBody: "asdf asdf qwerty zxcvbnm asdjkfh sample text 123",
    weights: STRATEGY_WEIGHTS,
    expectedTotalRange: [0, 15],
  },
  {
    name: "chatgpt-baseline",
    taskBrief: STRATEGY_BRIEF,
    submissionTitle: "International expansion recommendation",
    submissionBody: `# International Expansion Analysis for ContextCo

## Executive Summary

After careful consideration of ContextCo's current position with $4.8M ARR primarily from US customers, I recommend a measured international expansion approach. The UK market presents the most strategic opportunity given language alignment, regulatory familiarity, and an established B2B SaaS ecosystem.

## Recommended Market: United Kingdom

The UK offers several compelling advantages for ContextCo's first international move:

1. **Language alignment**: Reduces localization friction and accelerates time-to-market
2. **Mature B2B SaaS market**: Higher willingness to pay for software solutions
3. **Regulatory environment**: GDPR compliance from existing EU customers may transfer
4. **Strong tech ecosystem**: London is a major financial and tech hub

## Financial Framing

Based on industry benchmarks, ContextCo should expect:
- Initial market entry costs: $300K-$500K
- Year 1 revenue target: $400K-$600K ARR
- Breakeven timeline: 18-24 months
- Customer acquisition cost likely 1.3-1.5x US baseline

## Kill Thresholds

The expansion should be terminated if:
- Less than 10 qualified opportunities generated in first 6 months
- Customer acquisition costs exceed 2x US baseline
- Sales cycle exceeds 9 months on average

## Counter-Argument

The strongest case against expansion is that ContextCo should focus on deepening US market penetration first. With only $4.8M ARR, there's significant headroom in the existing market. International expansion divides leadership attention and capital that could otherwise drive faster organic growth. However, I believe the strategic value of geographic diversification and learning international go-to-market motions outweighs these concerns.

## Implementation Approach

1. **Q1 2026**: Hire UK-based country manager
2. **Q2 2026**: Establish London office and legal entity
3. **Q3 2026**: Launch with 3-5 lighthouse customers
4. **Q4 2026**: Scale based on initial traction

## Conclusion

International expansion to the UK in 2026 is a measured strategic move that positions ContextCo for long-term growth while managing risk through clear success metrics and kill thresholds.`,
    weights: STRATEGY_WEIGHTS,
    expectedTotalRange: [65, 78],
  },
  {
    name: "toronto-exceptional",
    taskBrief: STRATEGY_BRIEF,
    submissionTitle: "Recommendation: Toronto in Q2 2026, not London",
    submissionBody: `## Recommendation

**Enter Toronto in Q2 2026. Not London. Not yet.**

The default analysis points at London because of language, GDPR-ish familiarity, and tech-hub status. That's the templated answer. It's wrong for ContextCo specifically, for three reasons:

1. **CAC discipline matters more than TAM at $4.8M ARR.** London's B2B SaaS sales cycles are 30-50% longer than US baseline (per OpenView's 2024 expansion report). ContextCo's gross margin is 78%; another 4 months of payback delays burn through 14% of an annual contract's contribution before close. Toronto's sales cycles run within 10% of US baseline.
2. **The binding constraint isn't market size, it's CEO attention.** Spinning up a UK entity needs 6+ weeks of legal + tax setup, dedicated finance time, and a non-trivial product-marketing localization pass. Toronto: incorporation in 5 business days, GAAP-adjacent reporting, USD invoicing legal.
3. **Toronto is a learning bet that compounds.** If it works, ContextCo learned international go-to-market with one expat risk (sales hire), not five. The UK choice locks in irreversible spend before validating that ContextCo's playbook *generalizes*.

## Financial framing

| Phase | Investment | Trigger |
|---|---|---|
| Validation (Q2 2026) | $52K | One Toronto-based AE, one BDR, contractor sales ops |
| Full commitment (Q3-Q4) | $420K | Validation hits all three kill thresholds below |
| Breakeven ARR target | $1.4M | 18 months from Q2 2026 start |

CAC payback assumption: 14 months at $26K ACV (Toronto market data, mid-tier ContextCo segment). LTV/CAC at 4.2x. If actual CAC payback >18 months, kill — see thresholds.

## Three kill thresholds (any one fails → exit)

1. **Pipeline:** Fewer than 12 qualified opportunities in 90 days post-launch
2. **Sales cycle delta:** Average cycle >40 days longer than US-baseline same segment
3. **Closed-won:** Fewer than 4 closed-won deals by end of Q3 2026

## Pricing

Sell in USD, no discount. Two reasons: (a) Toronto enterprise buyers expect USD for SaaS — 73% of Canadian B2B SaaS purchases over $20K are USD-denominated (Y Combinator 2024 data); (b) discounting on entry sets the wrong anchor for future ICP work. Pricing flexibility is a tool for closing, not for market entry.

## Five named assumptions

1. ContextCo's product wedge (workflow automation for mid-market HR teams) is not US-cultural — verifiable via 5 customer-discovery calls with Toronto prospects in pre-launch.
2. Sales motion that works in Chicago works in Toronto — high confidence, validated by 3 ContextCo competitors who expanded north-first.
3. Brand recognition is irrelevant at this stage — ContextCo has 0% awareness in either market.
4. Currency volatility is bounded — CAD/USD has stayed in a 12% band for 3 years.
5. No regulatory event (Bill C-27, AI Act equivalent) ships before Q4 2026 — track quarterly.

## Counter-argument (strongest case against)

Wait until 2027. Use 2026 to push US ARR from $4.8M to $8M and approach international from a stronger base. Counter: by 2027, two of ContextCo's three largest US competitors will be international and capturing inbound demand that ContextCo will then have to fight for. Toronto in 2026 is the cheapest insurance against losing the "where's the Canadian version" inbound to incumbents.

The expansion happens. The only question is whether it's by choice in 2026 or by reaction in 2027.`,
    weights: STRATEGY_WEIGHTS,
    expectedTotalRange: [88, 94],
  },
];

const SCORE_KEYS = ["strategy", "execution", "communication", "technical", "creativity"] as const;

async function runOne(bench: Bench) {
  const prompt = buildPrompt(bench);
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });
  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned);
  const scores = {
    strategy: Number(parsed.score_strategy),
    execution: Number(parsed.score_execution),
    communication: Number(parsed.score_communication),
    technical: Number(parsed.score_technical),
    creativity: Number(parsed.score_creativity),
  };
  const total =
    scores.strategy * bench.weights.strategy +
    scores.execution * bench.weights.execution +
    scores.communication * bench.weights.communication +
    scores.technical * bench.weights.technical +
    scores.creativity * bench.weights.creativity;
  const [min, max] = bench.expectedTotalRange;
  const pass = total >= min && total <= max;

  console.log(`\n── ${bench.name} ──`);
  for (const k of SCORE_KEYS) {
    console.log(`  ${k.padEnd(14)} ${String(scores[k]).padStart(3)}`);
  }
  console.log(`  ${"weighted total".padEnd(14)} ${total.toFixed(1)}`);
  console.log(`  expected range: ${min}-${max}  →  ${pass ? "PASS ✓" : "FAIL ✗"}`);
  console.log(`  tokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`);
  return { name: bench.name, scores, total, pass };
}

function buildPrompt(bench: Bench): string {
  // Mirrors lib generateFeedback prompt verbatim (calibration block included).
  return `You are evaluating a student's submission for an early-career skill assessment platform called RuneShips. Be direct and useful. No corporate softening. This feedback is meant to genuinely help the student improve.

TASK BRIEF:
${bench.taskBrief}

Submission mode: text_only
Estimated time: unspecified
Posted by: ContextCo

STUDENT'S SUBMISSION:
Title: ${bench.submissionTitle}
Body:
${bench.submissionBody}

SCORE the submission on these five dimensions, each 0-100:

1. Strategy — analytical thinking, problem framing, decision logic
2. Execution — quality, completeness, attention to detail
3. Communication — clarity, structure, writing, presentation
4. Technical — appropriate use of tools, code, data, calculations
5. Creativity — original insight, novel framing, differentiated thinking

# Calibration by comparison — read these FIRST

Three reference submissions for a strategy task (international expansion recommendation). Match the submission you're grading to whichever reference it most closely resembles in depth and specificity.

**REFERENCE A — Templated AI baseline (~71 weighted).** Generic recommendation, default obvious answer (UK), industry-bench numbers without company-specific naming, standard kill-threshold ranges, acknowledges counter-arguments without engaging. Clean prose, every paragraph could appear in any deck. Scores: Strategy 71, Execution 68, Communication 76, Technical 62, Creativity 60.

**REFERENCE B — Solid human work (~80 weighted).** Engages specifically with the company, names 2-3 dollar figures, discusses 1-2 actual competitor moves, surfaces 1-2 assumptions, addresses one counter-argument substantively, mostly picks the obvious answer. Scores: Strategy 81, Execution 78, Communication 82, Technical 72, Creativity 73.

**REFERENCE C — Distinctive exceptional (~91 weighted).** Contrarian-but-defensible pick (Toronto over London), names $52K/$420K/$1.4M, three named kill thresholds, addresses wait-until-2027 counter-argument, five named assumptions, names binding constraint as CEO attention not market size, non-templated pricing argument. Scores: Strategy 92, Execution 90, Communication 90, Technical 78, Creativity 88.

# Scoring discipline

Pick the reference your submission most closely resembles. Score per dimension based on which reference each dimension matches.

Resembles A → 65-76 per dimension. Resembles B → 76-86. Resembles C → 88-94 on dimensions where these features matter. Better than C → 94-98.

Direct comparison: does this submission make more distinctive moves than Reference B? If yes, ≥ 84. As many as Reference C? If yes, ≥ 88. Sophistication theater (confident prose without specific support) does NOT count as signal.

# Weighted total

The weighted total is computed automatically — do not manually compute or "round" it. Score each dimension accurately; the total follows.

QUALITATIVE FEEDBACK (200-400 words) must cover: one specific strength with evidence, one specific area for improvement with concrete advice, whether reasoning was sound.

OUTPUT FORMAT — respond with ONLY this JSON object, no other text, no markdown fences:

{
  "score_strategy": <integer 0-100>,
  "score_execution": <integer 0-100>,
  "score_communication": <integer 0-100>,
  "score_technical": <integer 0-100>,
  "score_creativity": <integer 0-100>,
  "qualitative_feedback": "<200-400 word feedback>"
}`;
}

async function main() {
  console.log(`Running calibration benchmarks against ${MODEL}\n`);
  const results = [];
  for (const bench of BENCHMARKS) {
    try {
      results.push(await runOne(bench));
    } catch (err) {
      console.error(`\n[${bench.name}] FAILED:`, err);
    }
  }
  console.log(`\n── Summary ──`);
  for (const r of results) {
    console.log(`  ${r.name.padEnd(24)} total ${r.total.toFixed(1)}  ${r.pass ? "PASS ✓" : "FAIL ✗"}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
