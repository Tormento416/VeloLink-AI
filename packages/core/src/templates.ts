import { z } from "zod";
import { SECTION_TYPES, type SectionType } from "./sections/schemas";

/** The packages VeloLink sells. Each template belongs to exactly one. */
export const Package = z.enum(["single_page", "five_page", "seven_plus_page"]);
export type Package = z.infer<typeof Package>;

export const PAGE_LIMITS: Record<Package, { min: number; max: number | null }> = {
  single_page: { min: 1, max: 1 },
  five_page: { min: 5, max: 5 },
  seven_plus_page: { min: 7, max: null },
};

const sectionType = z.enum(SECTION_TYPES as [SectionType, ...SectionType[]]);

export const TemplatePage = z.object({
  slug: z.string(),
  title: z.string().min(1),
  sections: z.array(
    z.object({
      type: sectionType,
      variant: z.string().optional(),
      /** Guidance the AI follows when writing this section for this template. */
      guidance: z.string().min(1),
    }),
  ).min(1),
});

export const Template = z
  .object({
    id: z.string().min(1),
    version: z.number().int().positive(),
    name: z.string().min(1),
    package: Package,
    themeId: z.string().min(1),
    pages: z.array(TemplatePage).min(1),
  })
  .superRefine((t, ctx) => {
    const { min, max } = PAGE_LIMITS[t.package];
    const n = t.pages.length;
    if (n < min || (max !== null && n > max)) {
      ctx.addIssue({
        code: "custom",
        message: `${t.package} templates need ${max === null ? `at least ${min}` : min === max ? `exactly ${min}` : `${min}-${max}`} pages, got ${n}`,
      });
    }
    if (!t.pages.some((p) => p.slug === "")) {
      ctx.addIssue({ code: "custom", message: "Template needs a home page (slug \"\")" });
    }
  });
export type Template = z.infer<typeof Template>;

export function templatesForPackage(templates: readonly Template[], pkg: Package): Template[] {
  return templates.filter((t) => t.package === pkg);
}
