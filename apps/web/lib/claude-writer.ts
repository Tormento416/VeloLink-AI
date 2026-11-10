// Server code only: reads ANTHROPIC_API_KEY. Never import from a client component.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { WriterRefusal, type SectionWriter, type WriteRequest } from "@velolink/core";

/** Model used for site copy. Override with VELOLINK_AI_MODEL in Vercel env. */
export const DEFAULT_MODEL = "claude-opus-5-5";

type MessagesClient = Pick<Anthropic["beta"]["messages"], "create">;

/** Writes section copy with Claude, using structured outputs for the JSON shape. */
export class ClaudeSectionWriter implements SectionWriter {
  constructor(
    private readonly messages: MessagesClient,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async write({ system, prompt, schema }: WriteRequest): Promise<unknown> {
    const response = await this.messages.create({
      model: this.model,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: { type: "json_schema", schema: zodOutputFormat(schema).schema } },
    });

    if (response.stop_reason === "refusal") {
      throw new WriterRefusal(response.stop_details?.explanation ?? "The model declined to write this section");
    }
    if (response.stop_reason === "max_tokens") {
      throw new Error("Reply was cut off before it finished");
    }
    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("Reply had no text");
    return JSON.parse(text);
  }
}

/** The Claude writer when ANTHROPIC_API_KEY is set, otherwise null. */
export function claudeWriterFromEnv(): ClaudeSectionWriter | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();
  return new ClaudeSectionWriter(client.beta.messages, process.env.VELOLINK_AI_MODEL || DEFAULT_MODEL);
}
