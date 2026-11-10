import { Template } from "../templates";
import type { z } from "zod";

type TemplateInput = z.input<typeof Template>;

// The five launch styles. Each is inspired by a reference site Ade picked
// (2026-11-10); none copies its layout or branding.
const LIBRARY: TemplateInput[] = [
  {
    id: "essential",
    version: 1,
    name: "Essential",
    description: "Simple, modern and to the point. Cream and coral, serif headings, square edges, nothing fancy.",
    themeId: "essential",
    variants: { hero: "centered", services: "list", about: "text", contact: "details" },
    voice: "Calm and plain-spoken. Short sentences, no hype. Say what the business does and how to start.",
  },
  {
    id: "momentum",
    version: 1,
    name: "Momentum",
    description: "Modern and dynamic. Navy with a bright lime accent, bold grotesk type, dark hero, lifted cards.",
    themeId: "momentum",
    variants: { hero: "split", services: "grid", about: "image-left", contact: "details" },
    voice: "Confident and energetic. Active verbs, punchy headlines, lead with speed and results.",
    homeExtras: [{ type: "highlights", after: "hero" }],
  },
  {
    id: "flow",
    version: 1,
    name: "Flow",
    description: "Elegant, simple flow. Blue and amber, soft gradient hero, rounded cards and a how-it-works strip.",
    themeId: "flow",
    variants: { hero: "centered", services: "grid", about: "text", contact: "details" },
    voice: "Friendly and reassuring. Guide the visitor step by step and make getting started feel easy.",
    homeExtras: [
      { type: "highlights", after: "hero" },
      { type: "steps", after: "services" },
    ],
  },
  {
    id: "signature",
    version: 1,
    name: "Signature",
    description: "Simple with a subtle premium feel. Deep indigo and gold, Playfair headings, full-width hero.",
    themeId: "signature",
    variants: { hero: "full-bleed", services: "grid", about: "image-left", contact: "details-map" },
    voice: "Polished and understated. Elegant word choices, never flowery. Emphasise care, quality and attention to detail.",
    homeExtras: [{ type: "highlights", after: "hero" }],
  },
  {
    id: "hometown",
    version: 1,
    name: "Hometown",
    description: "Community first. Bright blue and orange, local news and involvement up front, social links in the footer.",
    themeId: "hometown",
    variants: { hero: "split", services: "grid", about: "text", contact: "details-map" },
    voice: "Neighbourly and proud of the area. Name the town, speak as part of the community, warm but not folksy.",
    homeExtras: [
      { type: "highlights", after: "hero" },
      { type: "community", after: "services" },
    ],
  },
];

/** Launch templates (visual styles), validated at load so a bad one fails fast. */
export const TEMPLATES: readonly Template[] = LIBRARY.map((t) => Template.parse(t));

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
