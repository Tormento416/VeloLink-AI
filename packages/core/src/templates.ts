import { z } from "zod";
import { SECTION_TYPES, Section, type SectionType } from "./sections/schemas";
import { PACKAGE_PAGES, type Package } from "./packages";

const sectionType = z.enum(SECTION_TYPES as [SectionType, ...SectionType[]]);

/**
 * A template is a visual style. It works with any package: the package
 * decides the pages, the template decides how each section looks and sounds.
 */
export const Template = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: z.number().int().positive(),
    name: z.string().min(1),
    description: z.string().min(1),
    themeId: z.string().min(1),
    /** Layout variant per section type; unset types use the section default. */
    variants: z.partialRecord(sectionType, z.string()).default({}),
    /** Tone and style guidance the AI follows for every section. */
    voice: z.string().min(1),
  })
  .superRefine((t, ctx) => {
    for (const [type, variant] of Object.entries(t.variants)) {
      const schema = Section.options.find((o) => o.shape.type.value === type);
      const allowed = schema?.shape.variant.unwrap().options as readonly string[] | undefined;
      if (allowed && !allowed.includes(variant)) {
        ctx.addIssue({ code: "custom", path: ["variants", type], message: `"${variant}" is not a ${type} variant (${allowed.join(", ")})` });
      }
    }
  });
export type Template = z.infer<typeof Template>;

export type PlannedSection = { type: SectionType; variant?: string };
export type PlannedPage = { slug: string; title: string; sections: PlannedSection[] };

/** Combines a package's pages with a template's style into the pages to generate. */
export function planSite(template: Template, pkg: Package): PlannedPage[] {
  return PACKAGE_PAGES[pkg].map((page) => ({
    slug: page.slug,
    title: page.title,
    sections: page.sections.map((type) => {
      const variant = template.variants[type];
      return variant === undefined ? { type } : { type, variant };
    }),
  }));
}
