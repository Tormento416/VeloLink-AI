import { describe, expect, it } from "vitest";
import { TEMPLATES } from "@velolink/core";
import { demoSiteFor } from "../lib/demo";

describe("demoSiteFor", () => {
  it.each(TEMPLATES.map((t) => [t.id, t] as const))("builds a valid sample site for %s", (_id, template) => {
    const site = demoSiteFor(template);
    expect(site.templateId).toBe(template.id);
    expect(site.pages.map((p) => p.slug)).toEqual(template.pages.map((p) => p.slug));
    expect(site.pages[0]!.sections.map((s) => s.type)).toEqual(template.pages[0]!.sections.map((s) => s.type));
  });

  it("throws for an unknown theme", () => {
    expect(() => demoSiteFor({ ...TEMPLATES[0]!, themeId: "nope" })).toThrow("Unknown theme nope");
  });
});
