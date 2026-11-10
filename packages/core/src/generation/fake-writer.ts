import type { Intake } from "./intake";
import type { SectionWriter, WriteRequest } from "./writer";

/**
 * Writes plain copy from intake facts without calling a model. Used in tests,
 * previews, and as a stand-in until the API key is set.
 */
export class TemplateCopyWriter implements SectionWriter {
  constructor(private readonly intake: Intake) {}

  async write({ sectionType }: WriteRequest): Promise<unknown> {
    const { business, services, story, highlights, faqs, primaryAction } = this.intake;
    const where = business.serviceArea ? ` in ${business.serviceArea}` : "";
    const label = primaryAction === "book" ? "Book online" : primaryAction === "quote" ? "Get a quote" : "Call now";
    switch (sectionType) {
      case "hero":
        return { headline: clip(`${business.name}${where}`, 90), subheadline: clip(services.join(", "), 220), ctaLabel: label };
      case "services":
        return { heading: "Services", items: services.map((name) => ({ name: clip(name, 60), description: clip(`${name}${where}.`, 240) })) };
      case "about":
        return { heading: `About ${clip(business.name, 70)}`, body: clip([story, ...highlights].filter(Boolean).join("\n\n") || `${business.name} serves customers${where}.`, 1500) };
      case "faq":
        return {
          heading: "Questions",
          items: (faqs.filter((f) => f.answer).length ? faqs.filter((f) => f.answer) : [{ question: "How do I get started?", answer: `Contact ${business.name} at ${business.phone}.` }]).map((f) => ({ question: f.question, answer: f.answer! })),
        };
      case "cta":
        return { heading: "Ready when you are", ctaLabel: label };
    }
  }
}

function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}
