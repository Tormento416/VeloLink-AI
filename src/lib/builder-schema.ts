import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const common = {
  business_name: text(120).min(1, "Business/site name is required"),
  existing_url: text(500).refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
    } catch { return false; }
  }, "Use a valid http:// or https:// website URL"),
  description: text(4000).min(1, "Business description is required"),
  industry: text(120).min(1, "Industry is required"),
  service_area: text(500),
  contact_name: text(120).min(1, "Contact name is required"),
  contact_email: z.string().trim().email().max(254),
  contact_phone: text(60),
  site_info: text(4000),
  template: z.enum(["service", "professional", "creative"]),
  color_scheme: z.enum(["navy-teal", "charcoal-ivory", "forest-light"]),
  customer_address: text(500).optional().default(""),
  customer_notes: text(4000).optional().default(""),
  selected_options: z.array(z.enum(["seo-engine", "video-backgrounds", "image-slideshows"])).max(3).optional().default([]),
};

export const repBuilderSchema = z.object({
  ...common,
  scope: z.enum(["single", "multi"]),
  page_count: z.number().int().min(1).max(50),
  pages: z.array(text(120).min(1)).min(1).max(50),
  payment_preference: z.enum(["one-time", "subscription"]),
  vapi: z.object({
    enabled: z.boolean(),
    model: text(120),
    voice_tier: z.enum(["Base", "Premium"]),
    monthly_minutes: z.number().int().min(0).max(1000000).nullable(),
  }).strict(),
}).strict().superRefine((data, ctx) => {
  if (data.pages.length !== data.page_count || (data.scope === "single" && data.page_count !== 1) || (data.scope === "multi" && data.page_count < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pages"], message: "Page names must match the selected page count and scope" });
  }
  if (new Set(data.pages.map((page) => page.toLowerCase())).size !== data.pages.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pages"], message: "Use a unique name for each page" });
  }
});

export type RepBuilderInput = z.infer<typeof repBuilderSchema>;

// Quote-only until an actual provider and verified server-side price catalog exist.
export const quoteHandoff = {
  status: "quote_requested",
  pricing_status: "pending_confirmation",
  checkout: { state: "quote_only", price_id: null, checkout_url: null },
  provisioning: "after_confirmation",
} as const;