import { describe, expect, it } from "vitest";
import { renderPageHtml, pageHref } from "../src/render/page";
import { demoSite } from "./fixtures";

const asset = (id: string) => `https://cdn.example/${id}`;

describe("renderPageHtml", () => {
  const html = renderPageHtml(demoSite, "", asset);

  it("produces a full HTML document with the business name as title", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Smith Plumbing</title>");
  });

  it("renders every section's content", () => {
    expect(html).toContain("<h1>Fast, honest plumbing in Austin</h1>");
    expect(html).toContain("<h3>Leak repair</h3>");
    expect(html).toContain('href="tel:5125550142"');
  });

  it("applies the theme variables", () => {
    expect(html).toContain("--vl-primary:#c2492f");
  });

  it("hides the nav on a single-page site", () => {
    expect(html).not.toContain('class="vl-nav"');
  });

  it("escapes content instead of injecting HTML", () => {
    const site = structuredClone(demoSite);
    const hero = site.pages[0]!.sections[0]!;
    if (hero.type !== "hero") throw new Error("fixture changed");
    hero.props.headline = "<script>alert(1)</script>";
    const out = renderPageHtml(site, "", asset);
    expect(out).not.toContain("<script>alert(1)</script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("throws for a missing page", () => {
    expect(() => renderPageHtml(demoSite, "pricing", asset)).toThrow('Page "pricing" not found in site');
  });
});

describe("pageHref", () => {
  it("maps the home slug to /", () => {
    expect(pageHref("")).toBe("/");
    expect(pageHref("about")).toBe("/about");
  });
});
