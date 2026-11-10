import { z } from "zod";
import { Section } from "./sections/schemas";
import { Theme } from "./theme";
import { Package, pageCountError } from "./packages";

export const Business = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(30),
  email: z.email().optional(),
  address: z.string().max(200).optional(),
  serviceArea: z.string().max(200).optional(),
});
export type Business = z.infer<typeof Business>;

export const Page = z.object({
  slug: z.string().regex(/^(|[a-z0-9-]+)$/, "Lowercase letters, digits and dashes; empty for home"),
  title: z.string().min(1).max(70),
  sections: z.array(Section).min(1),
});
export type Page = z.infer<typeof Page>;

export const Site = z
  .object({
    business: Business,
    theme: Theme,
    templateId: z.string().min(1),
    templateVersion: z.number().int().positive(),
    package: Package,
    pages: z.array(Page).min(1),
  })
  .refine((s) => s.pages.some((p) => p.slug === ""), { message: "A site needs a home page (slug \"\")" })
  .refine((s) => new Set(s.pages.map((p) => p.slug)).size === s.pages.length, {
    message: "Page slugs must be unique",
  })
  .superRefine((s, ctx) => {
    const err = pageCountError(s.package, s.pages.length);
    if (err) ctx.addIssue({ code: "custom", path: ["pages"], message: err });
  });
export type Site = z.infer<typeof Site>;
