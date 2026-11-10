import { z } from "zod";
import { Business } from "../site";
import { SafeHref } from "../sections/schemas";

const line = (max: number) => z.string().trim().min(1).max(max);

/**
 * What a rep collects on the deal form. These are the only facts the AI may use:
 * it writes copy around them but never invents new ones (prices, licenses, reviews).
 */
export const Intake = z.object({
  business: Business,
  /** Plain words, e.g. "residential plumbing". */
  industry: line(80),
  services: z.array(line(80)).min(1).max(12),
  /** The owner's story or anything that belongs on the About page. */
  story: z.string().trim().max(2000).optional(),
  /** Facts that set the business apart, e.g. "licensed and insured", "family owned since 2009". */
  highlights: z.array(line(160)).max(8).default([]),
  /** Real reviews the client supplied. The AI never writes reviews. */
  reviews: z
    .array(z.object({ author: line(60), quote: line(400), rating: z.number().int().min(1).max(5) }))
    .max(9)
    .default([]),
  hours: z.array(z.object({ days: line(40), time: line(40) })).max(7).default([]),
  /** Questions customers ask, with the client's answer when they gave one. */
  faqs: z.array(z.object({ question: line(160), answer: line(800).optional() })).max(15).default([]),
  /** What the main button does. */
  primaryAction: z.enum(["call", "book", "quote"]).default("call"),
  bookingUrl: SafeHref.optional(),
  /** Anything else the rep heard that should shape the copy. */
  notes: z.string().trim().max(2000).optional(),
});
export type Intake = z.infer<typeof Intake>;
export type IntakeInput = z.input<typeof Intake>;
