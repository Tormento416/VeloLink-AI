import { z } from "zod";
import { ICON_KEYS } from "./icons";

// Every section has a type, a layout variant, and content props.
// The same schema validates AI output and editor input.

const text = (max: number) => z.string().trim().min(1).max(max);
/** Links allowed in generated sites: on-site paths, anchors, tel, mailto, https. */
export const SafeHref = z
  .string()
  .trim()
  .regex(/^(\/[^\s]*|#[\w-]*|tel:\+?[\d\s().-]+|mailto:[^\s@]+@[^\s@]+|https:\/\/[^\s]+)$/, "Unsupported link");

export const ImageRef = z.object({
  assetId: z.string().min(1),
  alt: text(200),
});
export type ImageRef = z.infer<typeof ImageRef>;

export const Icon = z.enum(ICON_KEYS);

export const HeroSection = z.object({
  type: z.literal("hero"),
  variant: z.enum(["split", "full-bleed", "centered"]).default("split"),
  props: z.object({
    /** Short line above the headline, e.g. "Austin's family plumbers". */
    eyebrow: text(60).optional(),
    headline: text(90),
    subheadline: text(220).optional(),
    ctaLabel: text(30),
    ctaHref: SafeHref,
    secondaryCtaLabel: text(30).optional(),
    secondaryCtaHref: SafeHref.optional(),
    image: ImageRef.optional(),
  }),
});

export const ServicesSection = z.object({
  type: z.literal("services"),
  variant: z.enum(["grid", "list"]).default("grid"),
  props: z.object({
    heading: text(80),
    intro: text(240).optional(),
    items: z
      .array(z.object({ name: text(60), description: text(240), icon: Icon.optional(), image: ImageRef.optional() }))
      .min(1)
      .max(12),
  }),
});

export const AboutSection = z.object({
  type: z.literal("about"),
  variant: z.enum(["text", "image-left"]).default("text"),
  props: z.object({
    eyebrow: text(60).optional(),
    heading: text(80),
    body: text(1500),
    /** Short checklist points shown beside the text. */
    points: z.array(text(80)).max(6).optional(),
    image: ImageRef.optional(),
  }),
});

export const ReviewsSection = z.object({
  type: z.literal("reviews"),
  variant: z.enum(["cards"]).default("cards"),
  props: z.object({
    heading: text(80),
    items: z
      .array(z.object({ author: text(60), quote: text(400), rating: z.number().int().min(1).max(5) }))
      .min(1)
      .max(9),
  }),
});

export const FaqSection = z.object({
  type: z.literal("faq"),
  variant: z.enum(["accordion"]).default("accordion"),
  props: z.object({
    heading: text(80),
    intro: text(240).optional(),
    items: z.array(z.object({ question: text(160), answer: text(800) })).min(1).max(15),
  }),
});

export const ContactSection = z.object({
  type: z.literal("contact"),
  variant: z.enum(["details", "details-map"]).default("details"),
  props: z.object({
    heading: text(80),
    intro: text(240).optional(),
    phone: text(30),
    email: z.email().optional(),
    address: text(200).optional(),
    serviceArea: text(200).optional(),
    hours: z.array(z.object({ days: text(40), time: text(40) })).max(7).default([]),
  }),
});

export const CtaSection = z.object({
  type: z.literal("cta"),
  variant: z.enum(["banner"]).default("banner"),
  props: z.object({
    heading: text(90),
    subheading: text(200).optional(),
    ctaLabel: text(30),
    ctaHref: SafeHref,
    image: ImageRef.optional(),
  }),
});

/** Short trust facts, e.g. "Licensed and insured". Taken from intake, never written by the AI. */
export const HighlightsSection = z.object({
  type: z.literal("highlights"),
  variant: z.enum(["badges"]).default("badges"),
  props: z.object({
    items: z.array(text(160)).min(1).max(8),
  }),
});

/** How working with the business goes, step by step. */
export const StepsSection = z.object({
  type: z.literal("steps"),
  variant: z.enum(["numbered"]).default("numbered"),
  props: z.object({
    heading: text(80),
    items: z.array(z.object({ title: text(60), description: text(240) })).min(2).max(5),
  }),
});

/** Local involvement and news the client supplied: sponsorships, events, updates. */
export const CommunitySection = z.object({
  type: z.literal("community"),
  variant: z.enum(["cards"]).default("cards"),
  props: z.object({
    heading: text(80),
    items: z
      .array(z.object({ title: text(90), summary: text(300), date: text(40).optional(), href: SafeHref.optional(), image: ImageRef.optional() }))
      .min(1)
      .max(6),
  }),
});

/** Photos of the client's work. From approved assets only. */
export const GallerySection = z.object({
  type: z.literal("gallery"),
  variant: z.enum(["grid"]).default("grid"),
  props: z.object({
    heading: text(80),
    images: z.array(ImageRef).min(1).max(12),
  }),
});

/** Towns and neighbourhoods served; good for local search. */
export const AreasSection = z.object({
  type: z.literal("areas"),
  variant: z.enum(["chips"]).default("chips"),
  props: z.object({
    heading: text(80),
    intro: text(240).optional(),
    areas: z.array(text(60)).min(1).max(30),
  }),
});

export const Section = z.discriminatedUnion("type", [
  HeroSection,
  ServicesSection,
  AboutSection,
  ReviewsSection,
  FaqSection,
  ContactSection,
  CtaSection,
  HighlightsSection,
  StepsSection,
  CommunitySection,
  GallerySection,
  AreasSection,
]);

export type Section = z.infer<typeof Section>;
export type SectionType = Section["type"];
export const SECTION_TYPES = Section.options.map((o) => o.shape.type.value) as SectionType[];
