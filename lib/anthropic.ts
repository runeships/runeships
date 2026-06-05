import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client.
 *
 * Do not import this from a Client Component — `ANTHROPIC_API_KEY` is a
 * server secret and must not be bundled for the browser.
 */

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "ANTHROPIC_API_KEY is not set. Add it to .env.local (and to your Vercel project's environment variables for deployments).",
  );
}

export const anthropic = new Anthropic({ apiKey });

/**
 * Default model: Claude Haiku 4.5 — fastest + cheapest current-gen model,
 * chosen here for cost control. Override per-call by passing `model` to
 * `createMessage` if a task warrants Sonnet or Opus.
 */
export const DEFAULT_MODEL = "claude-haiku-4-5";

/**
 * Default max_tokens cap. Kept deliberately low (800) so a runaway prompt
 * can't rack up a large bill. Raise per-call when you actually need a
 * longer response.
 */
export const DEFAULT_MAX_TOKENS = 800;

type MessageCreateParams = Anthropic.Messages.MessageCreateParamsNonStreaming;

/**
 * Thin wrapper around `anthropic.messages.create` that applies the
 * RuneShips defaults (Haiku 4.5, max_tokens 800). Pass any field to
 * override.
 *
 * @example
 *   const reply = await createMessage({
 *     messages: [{ role: "user", content: "Hello" }],
 *   });
 */
export async function createMessage(
  params: Omit<MessageCreateParams, "model" | "max_tokens"> &
    Partial<Pick<MessageCreateParams, "model" | "max_tokens">>,
) {
  return anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: DEFAULT_MAX_TOKENS,
    ...params,
  });
}
