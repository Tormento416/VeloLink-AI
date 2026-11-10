import { describe, expect, it } from "vitest";
import { COPY_SCHEMAS, SYSTEM_PROMPT, WriterRefusal } from "@velolink/core";
import { ClaudeSectionWriter, DEFAULT_MODEL } from "../lib/claude-writer";

type Reply = { stop_reason: string; stop_details?: { explanation?: string } | null; content: { type: string; text?: string }[] };

function fakeClient(reply: Reply) {
  const calls: any[] = [];
  return {
    calls,
    client: { create: async (params: any) => (calls.push(params), reply) } as any,
  };
}

const request = { sectionType: "hero" as const, system: SYSTEM_PROMPT, prompt: "brief", schema: COPY_SCHEMAS.hero };

describe("ClaudeSectionWriter", () => {
  it("sends structured output, fallbacks and the stable system prompt", async () => {
    const { client, calls } = fakeClient({ stop_reason: "end_turn", content: [{ type: "text", text: '{"headline":"Hi","ctaLabel":"Call"}' }] });
    const out = await new ClaudeSectionWriter(client).write(request);
    expect(out).toEqual({ headline: "Hi", ctaLabel: "Call" });
    const p = calls[0];
    expect(p.model).toBe(DEFAULT_MODEL);
    expect(p.system).toBe(SYSTEM_PROMPT);
    expect(p.fallbacks).toBe("default");
    expect(p.betas).toContain("server-side-fallback-2026-07-01");
    expect(p.output_config.format.type).toBe("json_schema");
    expect(p.output_config.format.schema.properties).toHaveProperty("headline");
    expect(p).not.toHaveProperty("tool_choice");
  });

  it("turns a refusal into WriterRefusal", async () => {
    const { client } = fakeClient({ stop_reason: "refusal", stop_details: { explanation: "no" }, content: [] });
    await expect(new ClaudeSectionWriter(client).write(request)).rejects.toBeInstanceOf(WriterRefusal);
  });

  it("treats a cut-off reply as a retryable error", async () => {
    const { client } = fakeClient({ stop_reason: "max_tokens", content: [{ type: "text", text: '{"head' }] });
    const err = await new ClaudeSectionWriter(client).write(request).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(WriterRefusal);
  });
});
