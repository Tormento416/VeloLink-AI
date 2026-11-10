import { describe, expect, it } from "vitest";
import { Theme, THEMES, themeClasses, themeFontsHref } from "../src/theme";
import { TEMPLATES, getTemplate } from "../src/template-library";
import { planSite } from "../src/templates";
import { Package } from "../src/packages";
import { renderPageHtml } from "../src/render/page";
import { BASE_CSS } from "../src/render/styles";
import { Business } from "../src/site";
import { demoSite } from "./fixtures";

// WCAG relative luminance and contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe("launch styles", () => {
  it("has five templates, each with its own theme", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(["essential", "momentum", "flow", "signature", "hometown"]);
    expect(new Set(TEMPLATES.map((t) => t.themeId)).size).toBe(5);
  });

  it.each(Object.values(THEMES))("$id keeps text readable (WCAG AA)", (t) => {
    const c = t.colors;
    expect(contrast(c.text, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.muted, c.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.text, c.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.onAccent, c.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.primary, c.background)).toBeGreaterThanOrEqual(4.5); // links
  });

  it("places home extras after the named section", () => {
    const home = planSite(getTemplate("flow")!, "five_page")[0]!;
    expect(home.sections.map((s) => s.type)).toEqual(["hero", "highlights", "services", "steps", "reviews", "cta"]);
  });

  it("only adds extras to the home page", () => {
    for (const t of TEMPLATES) {
      for (const pkg of Package.options) {
        const [, ...rest] = planSite(t, pkg);
        for (const page of rest) expect(page.sections.map((s) => s.type)).not.toContain("highlights");
      }
    }
  });
});

describe("theme helpers", () => {
  it("builds a Google Fonts URL, or null for system fonts", () => {
    expect(themeFontsHref(THEMES["signature"]!)).toBe(
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;600&display=swap",
    );
    expect(themeFontsHref({ ...THEMES["signature"]!, fonts: { ...THEMES["signature"]!.fonts, load: [] } })).toBeNull();
  });

  it("rejects a font name that could break the URL", () => {
    const bad = { ...THEMES["flow"]!, fonts: { ...THEMES["flow"]!.fonts, load: ['Inter"><script>'] } };
    expect(Theme.safeParse(bad).success).toBe(false);
  });

  it("maps theme styles to wrapper classes", () => {
    expect(themeClasses(THEMES["momentum"]!)).toBe("vl-site vl-hero-bg--dark vl-cards--shadow vl-motion--subtle");
  });

  it("only animates when the visitor allows motion", () => {
    const motion = BASE_CSS.indexOf("animation:");
    expect(motion).toBeGreaterThan(BASE_CSS.indexOf("@media (prefers-reduced-motion:no-preference)"));
  });
});

describe("rendering the new pieces", () => {
  const asset = (id: string) => `https://cdn.example/${id}`;

  it("loads the theme's fonts and applies its classes", () => {
    const html = renderPageHtml(demoSite, "", asset);
    expect(html).toContain('href="https://fonts.googleapis.com/css2?family=Fraunces');
    expect(html).toContain('class="vl-site vl-hero-bg--plain vl-cards--flat vl-motion--none vl-skin--essential"');
  });

  it("renders highlights, steps, community and social links", () => {
    const site = structuredClone(demoSite);
    site.business.social = [{ network: "instagram", href: "https://instagram.com/smith" }];
    site.pages[0]!.sections.push(
      { type: "highlights", variant: "badges", props: { items: ["Licensed and insured"] } },
      { type: "steps", variant: "numbered", props: { heading: "How it works", items: [{ title: "Call", description: "Ring us." }, { title: "Fix", description: "We fix it." }] } },
      { type: "community", variant: "cards", props: { heading: "In the community", items: [{ title: "Little league sponsor", summary: "Proud sponsor of the Tigers.", date: "Spring 2026" }] } },
    );
    const html = renderPageHtml(site, "", asset);
    expect(html).toMatch(/<li><svg[^>]*>.*?<\/svg>Licensed and insured<\/li>/);
    expect(html).toContain("<h3>Fix</h3>");
    expect(html).toContain("Little league sponsor");
    expect(html).toContain('href="https://instagram.com/smith"');
    expect(html).toContain(">Instagram</a>");
  });

  it("only accepts https social links", () => {
    const r = Business.safeParse({ name: "A", phone: "1", social: [{ network: "facebook", href: "/fb" }] });
    expect(r.success).toBe(false);
  });
});
