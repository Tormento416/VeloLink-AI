import { describe, expect, it } from "vitest";
import { Package, PACKAGE_PAGES, TEMPLATES } from "@velolink/core";
import { demoSiteFor } from "../lib/demo";

describe("demoSiteFor", () => {
  it("builds a valid sample site for every template and package", () => {
    for (const t of TEMPLATES) {
      for (const pkg of Package.options) {
        const site = demoSiteFor(t, pkg);
        expect(site.templateId).toBe(t.id);
        expect(site.package).toBe(pkg);
        expect(site.pages.map((p) => p.slug)).toEqual(PACKAGE_PAGES[pkg].map((p) => p.slug));
      }
    }
  });

  it("applies the template's section variants", () => {
    const warm = TEMPLATES.find((t) => t.id === "signature")!;
    const hero = demoSiteFor(warm, "five_page").pages[0]!.sections[0]!;
    expect(hero).toMatchObject({ type: "hero", variant: "full-bleed" });
  });

  it("throws for an unknown theme", () => {
    expect(() => demoSiteFor({ ...TEMPLATES[0]!, themeId: "nope" }, "single_page")).toThrow("Unknown theme nope");
  });
});
