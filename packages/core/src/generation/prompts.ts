import type { Template } from "../templates";
import type { CopySectionType } from "./copy";
import type { Intake } from "./intake";

/** Same text for every site and section so the API can cache it. */
export const SYSTEM_PROMPT = `You write website copy for local service businesses: plumbers, salons, contractors, clinics and similar. A VeloLink team member reviews every site before the customer sees it.

Rules:
- Use only the facts in the brief. Do not invent prices, years in business, licenses, certifications, awards, guarantees, staff names, statistics or reviews. If a fact would help but is missing, write around it.
- Write for the business's customers, in the business's voice ("we"), in plain American English.
- Name the town or service area when the brief gives one; it helps local search.
- Keep every field within its length limit. Prefer shorter.
- No exclamation marks, emoji, or filler like "look no further" or "one-stop shop".
- Follow the style notes for the template.

Reply with JSON that matches the given schema.`;

const SECTION_TASKS: Record<CopySectionType, string> = {
  hero: "Write the hero: a headline that says what the business does and where, an optional one-sentence subheadline, and a short button label for the main action.",
  services: "Write the services section: a heading and one item per service in the brief, in the same order, each with a one or two sentence description of what the customer gets.",
  about: "Write the about section: a heading and two or three short paragraphs (separate them with a blank line) built from the story and highlights.",
  faq: "Write the FAQ section: a heading and the questions from the brief. Keep the client's answers' meaning; tighten the wording. For a question without an answer, answer only from the brief's facts, and leave the question out if the brief can't answer it. If the brief has no questions, write three to five common questions this business can answer from the brief's facts.",
  steps: "Write a how-it-works section: a heading and three or four steps a customer goes through, from first contact to job done, each with a short title and one sentence. Use only what the brief says about how the business works; keep steps general when it says nothing.",
  cta: "Write a call-to-action banner: a short heading that invites the visitor to act, and a button label for the main action.",
};

const ACTION_WORDS: Record<Intake["primaryAction"], string> = {
  call: "call the business",
  book: "book online",
  quote: "request a quote",
};

export type PromptContext = {
  template: Template;
  intake: Intake;
  pageTitle: string;
  sectionType: CopySectionType;
};

/** Site facts first, then the task, so related calls share a prefix. */
export function buildSectionPrompt({ template, intake, pageTitle, sectionType }: PromptContext): string {
  const b = intake.business;
  const lines = [
    "<brief>",
    `Business: ${b.name}`,
    `Industry: ${intake.industry}`,
    b.serviceArea ? `Service area: ${b.serviceArea}` : null,
    b.address ? `Address: ${b.address}` : null,
    `Services: ${intake.services.join("; ")}`,
    intake.highlights.length ? `Highlights: ${intake.highlights.join("; ")}` : null,
    intake.story ? `Story: ${intake.story}` : null,
    `Main action: ${ACTION_WORDS[intake.primaryAction]}`,
    intake.faqs.length
      ? `Customer questions:\n${intake.faqs.map((f) => `- Q: ${f.question}${f.answer ? `\n  A: ${f.answer}` : ""}`).join("\n")}`
      : null,
    intake.notes ? `Rep notes: ${intake.notes}` : null,
    "</brief>",
    "",
    `<style template="${template.name}">${template.voice}</style>`,
    "",
    `Page: ${pageTitle}`,
    SECTION_TASKS[sectionType],
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/** Appended on a retry so the model can fix what failed. */
export function retryNote(issues: string[]): string {
  return `\n\nYour previous reply was rejected:\n${issues.map((i) => `- ${i}`).join("\n")}\nWrite the section again and fix these problems.`;
}
