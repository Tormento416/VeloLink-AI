import { z } from "zod";
import { AboutSection, CtaSection, FaqSection, HeroSection, ServicesSection, type SectionType } from "../sections/schemas";

/**
 * The parts of each section the AI writes. Picked from the section schemas so the
 * length limits stay in one place. Links, images, reviews and contact details are
 * filled from intake facts, never by the AI.
 */
export const COPY_SCHEMAS = {
  hero: HeroSection.shape.props.pick({ headline: true, subheadline: true, ctaLabel: true }),
  services: ServicesSection.shape.props,
  about: AboutSection.shape.props.pick({ heading: true, body: true }),
  faq: FaqSection.shape.props,
  cta: CtaSection.shape.props.pick({ heading: true, ctaLabel: true }),
} satisfies Partial<Record<SectionType, z.ZodObject>>;

export type CopySectionType = keyof typeof COPY_SCHEMAS;
export type SectionCopy<T extends CopySectionType> = z.infer<(typeof COPY_SCHEMAS)[T]>;

export function isCopySection(type: SectionType): type is CopySectionType {
  return type in COPY_SCHEMAS;
}
