import { z } from "zod";

// Every section has a type, a layout variant, and content props.
// The same schema validates AI output and editor input.

const text = (max: number) => z.string().trim().min(1).max(max);
/** Links allowed in generated sites: on-site paths, anchors, tel, mailto, https. */
export const SafeHref = z
  .string()
  .trim()
  .regex(/^(\/[^\s]*|#[\w-]*|tel:\+?[\d\s().-]+|mailto:[^\s@]+@[^\s@]+|https:\/\/[^\s]+)$/, "Unsupported link");

const imageRef = z.object({
  assetId: z.string().min(1),
  alt: text(200),
});

export const HeroSection = z.object({
  type: z.literal("hero"),
  variant: z.enum(["split", "full-bleed", "centered"]).default("split"),
  props: z.object({
    headline: text(90),
    subheadline: text(220).optional(),
    ctaLabel: text(30),
    ctaHref: SafeHref,
    image: imageRef.optional(),
  }),
});

export const ServicesSection = z.object({
  type: z.literal("services"),
  variant: z.enum(["grid", "list"]).default("grid"),
  props: z.object({
    heading: text(80),
    items: z
      .array(z.object({ name: text(60), description: text(240) }))
      .min(1)
      .max(12),
  }),
});

export const AboutSection = z.object({
  type: z.literal("about"),
  variant: z.enum(["text", "image-left"]).default("text"),
  props: z.object({
    heading: text(80),
    body: text(1500),
    image: imageRef.optional(),
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
    items: z.array(z.object({ question: text(160), answer: text(800) })).min(1).max(15),
  }),
});

export const ContactSection = z.object({
  type: z.literal("contact"),
  variant: z.enum(["details", "details-map"]).default("details"),
  props: z.object({
    heading: text(80),
    phone: text(30),
    email: z.email().optional(),
    address: text(200).optional(),
    hours: z.array(z.object({ days: text(40), time: text(40) })).max(7).default([]),
  }),
});

export const CtaSection = z.object({
  type: z.literal("cta"),
  variant: z.enum(["banner"]).default("banner"),
  props: z.object({
    heading: text(90),
    ctaLabel: text(30),
    ctaHref: SafeHref,
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
]);

export type Section = z.infer<typeof Section>;
export type SectionType = Section["type"];
export const SECTION_TYPES = Section.options.map((o) => o.shape.type.value) as SectionType[];
