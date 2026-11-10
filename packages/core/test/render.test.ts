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

  it("links to sections on a single-page site", () => {
    expect(html).toContain('href="#services"');
    expect(html).toContain('href="#contact"');
    expect(html).not.toContain('href="#hero"');
  });

  it("puts a call button in the header", () => {
    expect(html).toMatch(/class="vl-button vl-header__call" href="tel:5125550142"/);
  });

  it("shows the average rating and review count", () => {
    const site = structuredClone(demoSite);
    site.pages[0]!.sections.push({ type: "reviews", variant: "cards", props: { heading: "Reviews", items: [{ author: "Ann Lee", quote: "Great", rating: 5 }, { author: "Bo", quote: "Good", rating: 4 }] } });
    const out = renderPageHtml(site, "", asset);
    expect(out).toContain("<strong>4.5</strong>");
    expect(out).toContain("2 reviews");
    expect(out).toContain(">AL</span>");
  });

  it("embeds a map only for the map variant, with the address encoded", () => {
    const site = structuredClone(demoSite);
    const contact = site.pages[0]!.sections.find((s) => s.type === "contact")!;
    if (contact.type !== "contact") throw new Error("fixture changed");
    contact.props.address = "1 Main St & 2nd, Austin";
    expect(renderPageHtml(site, "", asset)).not.toContain("<iframe");
    contact.variant = "details-map";
    expect(renderPageHtml(site, "", asset)).toContain("maps?q=1%20Main%20St%20%26%202nd%2C%20Austin&amp;output=embed");
  });

  it("uses artwork instead of a broken image when a hero has no photo", () => {
    expect(html).toContain('class="vl-art "');
    expect(html).not.toContain("<img");
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
