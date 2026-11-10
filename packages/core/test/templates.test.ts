import { describe, expect, it } from "vitest";
import { Template, planSite } from "../src/templates";
import { PACKAGE_PAGES, pageCountError, Package } from "../src/packages";
import { TEMPLATES, getTemplate } from "../src/template-library";
import { THEMES } from "../src/theme";

const base = { id: "t", version: 1, name: "T", description: "d", themeId: "essential", voice: "v" };

describe("Template schema", () => {
  it("accepts a valid style", () => {
    expect(Template.parse({ ...base, variants: { hero: "centered" } }).variants).toEqual({ hero: "centered" });
  });

  it("rejects a variant the section doesn't have", () => {
    const r = Template.safeParse({ ...base, variants: { hero: "carousel" } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe('"carousel" is not a hero variant (split, full-bleed, centered)');
  });
});

describe("packages", () => {
  it.each([
    ["single_page", 1],
    ["five_page", 5],
    ["seven_plus_page", 7],
  ] as const)("%s has %i default pages, including home", (pkg, n) => {
    expect(PACKAGE_PAGES[pkg]).toHaveLength(n);
    expect(PACKAGE_PAGES[pkg][0]?.slug).toBe("");
    expect(pageCountError(pkg, n)).toBeNull();
  });

  it("explains page count errors", () => {
    expect(pageCountError("single_page", 2)).toBe("single_page sites need exactly 1 pages, got 2");
    expect(pageCountError("seven_plus_page", 6)).toBe("seven_plus_page sites need at least 7 pages, got 6");
    expect(pageCountError("seven_plus_page", 12)).toBeNull();
  });
});

describe("planSite", () => {
  it("works for every template and package combination", () => {
    for (const t of TEMPLATES) {
      for (const pkg of Package.options) {
        const plan = planSite(t, pkg);
        expect(plan.map((p) => p.slug)).toEqual(PACKAGE_PAGES[pkg].map((p) => p.slug));
      }
    }
  });

  it("applies the template's variants and leaves others to defaults", () => {
    const plan = planSite(getTemplate("signature")!, "single_page");
    expect(plan[0]!.sections).toEqual([
      { type: "hero", variant: "full-bleed" },
      { type: "highlights" },
      { type: "services", variant: "grid" },
      { type: "about", variant: "image-left" },
      { type: "reviews" },
      { type: "faq" },
      { type: "contact", variant: "details-map" },
    ]);
  });
});

describe("Template library", () => {
  it("every template uses a known theme and a unique id", () => {
    for (const t of TEMPLATES) expect(Object.keys(THEMES)).toContain(t.themeId);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
  });

  it("looks up a template by id", () => {
    expect(getTemplate("essential")?.name).toBe("Essential");
    expect(getTemplate("nope")).toBeUndefined();
  });
});
