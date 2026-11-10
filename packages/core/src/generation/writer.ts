import type { z } from "zod";
import type { CopySectionType } from "./copy";

export type WriteRequest = {
  sectionType: CopySectionType;
  /** Stable instructions, identical across sites so they can be cached. */
  system: string;
  /** Site-specific facts and the task for this one section. */
  prompt: string;
  /** Shape the reply must match. */
  schema: z.ZodObject;
};

/** Writes one section's copy. Returns raw JSON; the generator validates it. */
export interface SectionWriter {
  write(request: WriteRequest): Promise<unknown>;
}

/** Thrown by a writer when the model declines. Not retried. */
export class WriterRefusal extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WriterRefusal";
  }
}
