import { describe, expect, it } from "vitest";
import { Template, templatesForPackage } from "../src/templates";
import { TEMPLATES, getTemplate } from "../src/template-library";
import { THEMES } from "../src/theme";

const page = (slug: string) => ({ slug, title: slug || "Home", sections: [{ type: "hero" as const, guidance: "g" }] });

describe("Template schema", () => {
  it("rejects a single-page template with two pages", () => {
    const r = Template.safeParse({ id: "t", version: 1, name: "T", package: "single_page", themeId: "clean-blue", pages: [page(""), page("about")] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("single_page templates need exactly 1 pages, got 2");
  });

  it("requires at least 7 pages for the 7+ package", () => {
    const pages = ["", "a", "b", "c", "d", "e"].map(page);
    const r = Template.safeParse({ id: "t", version: 1, name: "T", package: "seven_plus_page", themeId: "clean-blue", pages });
    expect(r.error?.issues[0]?.message).toBe("seven_plus_page templates need at least 7 pages, got 6");
  });

  it("accepts a 5-page template", () => {
    const pages = ["", "services", "about", "reviews", "contact"].map(page);
    const r = Template.safeParse({ id: "t", version: 1, name: "T", package: "five_page", themeId: "clean-blue", pages });
    expect(r.success).toBe(true);
  });
});

describe("Template library", () => {
  it("every template uses a known theme", () => {
    for (const t of TEMPLATES) expect(Object.keys(THEMES)).toContain(t.themeId);
  });

  it("filters templates by package", () => {
    expect(templatesForPackage(TEMPLATES, "single_page").map((t) => t.id)).toEqual(["local-pro-single"]);
    expect(templatesForPackage(TEMPLATES, "five_page")).toEqual([]);
  });

  it("looks up a template by id", () => {
    expect(getTemplate("local-pro-single")?.package).toBe("single_page");
    expect(getTemplate("nope")).toBeUndefined();
  });
});
