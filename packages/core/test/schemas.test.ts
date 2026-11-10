import { describe, expect, it } from "vitest";
import { Section, SECTION_TYPES, SafeHref } from "../src/sections/schemas";
import { Site } from "../src/site";
import { Theme, THEMES, themeToCss } from "../src/theme";
import { demoSite } from "./fixtures";

describe("Section schema", () => {
  it("lists every section type", () => {
    expect(SECTION_TYPES).toEqual(["hero", "services", "about", "reviews", "faq", "contact", "cta"]);
  });

  it("fills in the default variant", () => {
    const s = Section.parse({ type: "cta", props: { heading: "Book today", ctaLabel: "Book", ctaHref: "/contact" } });
    expect(s.variant).toBe("banner");
  });

  it("rejects an unknown section type", () => {
    const r = Section.safeParse({ type: "carousel", props: {} });
    expect(r.success).toBe(false);
  });

  it("rejects a hero headline over 90 characters", () => {
    const r = Section.safeParse({ type: "hero", props: { headline: "x".repeat(91), ctaLabel: "Go", ctaHref: "/" } });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["props", "headline"]);
  });
});

describe("SafeHref", () => {
  it.each(["/", "/contact", "#contact", "tel:+15125550142", "mailto:a@b.co", "https://example.com/x"])("accepts %s", (href) => {
    expect(SafeHref.parse(href)).toBe(href);
  });
  it.each(["javascript:alert(1)", "http://example.com", "data:text/html,hi", ""])("rejects %s", (href) => {
    expect(SafeHref.safeParse(href).success).toBe(false);
  });
});

describe("Site schema", () => {
  it("accepts the demo site", () => {
    expect(Site.parse(demoSite).business.name).toBe("Smith Plumbing");
  });

  it("requires a home page", () => {
    const r = Site.safeParse({ ...demoSite, pages: [{ ...demoSite.pages[0]!, slug: "about" }] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe('A site needs a home page (slug "")');
  });

  it("rejects duplicate page slugs", () => {
    const home = demoSite.pages[0]!;
    const r = Site.safeParse({ ...demoSite, pages: [home, home] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("Page slugs must be unique");
  });
});

describe("Theme", () => {
  it("validates the built-in themes", () => {
    for (const t of Object.values(THEMES)) expect(Theme.parse(t).id).toBe(t.id);
  });

  it("rejects a font stack that could break out of the style tag", () => {
    const bad = { ...THEMES["clean-blue"]!, fonts: { heading: "x}</style><script>", body: "Arial" } };
    expect(Theme.safeParse(bad).success).toBe(false);
  });

  it("emits CSS variables", () => {
    const css = themeToCss(THEMES["clean-blue"]!);
    expect(css).toContain("--vl-primary:#1d4ed8");
    expect(css).toContain("--vl-radius:8px");
  });
});

describe("Site package rules", () => {
  it("rejects a single-page site with two pages", () => {
    const home = demoSite.pages[0]!;
    const r = Site.safeParse({ ...demoSite, pages: [home, { ...home, slug: "about" }] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("single_page sites need exactly 1 pages, got 2");
  });
});
