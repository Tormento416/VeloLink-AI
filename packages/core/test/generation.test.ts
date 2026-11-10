import { describe, expect, it } from "vitest";
import {
  buildSectionPrompt,
  generateSite,
  GenerationError,
  Intake,
  primaryHref,
  SYSTEM_PROMPT,
  TemplateCopyWriter,
  WriterRefusal,
  type SectionWriter,
  type WriteRequest,
} from "../src/generation";
import { getTemplate } from "../src/template-library";
import { Package } from "../src/packages";

const intake = Intake.parse({
  business: { name: "Smith Plumbing", phone: "(512) 555-0142", serviceArea: "Austin, TX", hours: [{ days: "Mon–Fri", time: "7am–6pm" }] },
  industry: "residential plumbing",
  services: ["Leak repair", "Water heaters", "Drain cleaning"],
  story: "Family owned since 2009.",
  highlights: ["Licensed and insured"],
  reviews: [{ author: "Dana R.", quote: "On time and fairly priced.", rating: 5 }],
  faqs: [{ question: "Do you offer emergency service?", answer: "Yes, 24/7." }],
});
const template = getTemplate("essential")!;

/** Records every request and answers with the fake writer. */
class Recorder implements SectionWriter {
  requests: WriteRequest[] = [];
  private inner = new TemplateCopyWriter(intake);
  async write(req: WriteRequest) {
    this.requests.push(req);
    return this.inner.write(req);
  }
}

describe("generateSite", () => {
  it.each(Package.options)("builds a valid %s site", async (pkg) => {
    const { site } = await generateSite({ template, pkg, intake, writer: new TemplateCopyWriter(intake) });
    expect(site.package).toBe(pkg);
    expect(site.templateId).toBe("essential");
    expect(site.pages[0]!.sections[0]!.type).toBe("hero");
  });

  it("copies reviews and contact details from intake, never from the AI", async () => {
    const writer = new Recorder();
    const { site, log } = await generateSite({ template, pkg: "single_page", intake, writer });
    expect(writer.requests.map((r) => r.sectionType)).not.toContain("reviews");
    expect(writer.requests.map((r) => r.sectionType)).not.toContain("contact");
    const reviews = site.pages[0]!.sections.find((s) => s.type === "reviews");
    expect(reviews?.props).toMatchObject({ items: intake.reviews });
    expect(log.find((l) => l.type === "contact")?.source).toBe("intake");
  });

  it("skips the reviews section when no reviews were supplied", async () => {
    const noReviews = { ...intake, reviews: [] };
    const { site, skipped } = await generateSite({ template, pkg: "five_page", intake: noReviews, writer: new TemplateCopyWriter(noReviews) });
    expect(site.pages.flatMap((p) => p.sections).some((s) => s.type === "reviews")).toBe(false);
    expect(skipped.length).toBeGreaterThan(0);
  });

  it("writes hero and services once even when several pages use them", async () => {
    const writer = new Recorder();
    await generateSite({ template, pkg: "seven_plus_page", intake, writer });
    const types = writer.requests.map((r) => r.sectionType);
    expect(types.filter((t) => t === "services")).toHaveLength(1);
    expect(types.filter((t) => t === "hero")).toHaveLength(1);
  });

  it("applies the template's variants", async () => {
    const warm = getTemplate("signature")!;
    const { site } = await generateSite({ template: warm, pkg: "single_page", intake, writer: new TemplateCopyWriter(intake) });
    expect(site.pages[0]!.sections.find((s) => s.type === "hero")?.variant).toBe("full-bleed");
  });

  it("fills the button link from intake, not from the AI", async () => {
    const writer: SectionWriter = {
      async write(req) {
        const base = (await new TemplateCopyWriter(intake).write(req)) as Record<string, unknown>;
        return req.sectionType === "hero" ? { ...base, ctaHref: "javascript:alert(1)" } : base;
      },
    };
    const { site } = await generateSite({ template, pkg: "single_page", intake, writer });
    const hero = site.pages[0]!.sections[0]!;
    expect(hero.type === "hero" && hero.props.ctaHref).toBe("tel:5125550142");
  });

  it("retries with the validation errors and succeeds", async () => {
    let heroCalls = 0;
    const prompts: string[] = [];
    const writer: SectionWriter = {
      async write(req) {
        if (req.sectionType === "hero") {
          heroCalls++;
          prompts.push(req.prompt);
          if (heroCalls === 1) return { headline: "x".repeat(200), ctaLabel: "Call" };
        }
        return new TemplateCopyWriter(intake).write(req);
      },
    };
    const { log } = await generateSite({ template, pkg: "single_page", intake, writer });
    expect(heroCalls).toBe(2);
    expect(prompts[1]).toContain("headline");
    expect(prompts[1]).toContain("rejected");
    expect(log.find((l) => l.type === "hero")?.attempts).toBe(2);
  });

  it("gives up after maxAttempts and names the failing section", async () => {
    const writer: SectionWriter = {
      async write(req) {
        return req.sectionType === "faq" ? { heading: "Q", items: [] } : new TemplateCopyWriter(intake).write(req);
      },
    };
    const err = await generateSite({ template, pkg: "single_page", intake, writer, maxAttempts: 2 }).catch((e) => e);
    expect(err).toBeInstanceOf(GenerationError);
    expect((err as GenerationError).failures.map((f) => f.type)).toEqual(["faq"]);
  });

  it("does not retry a refusal", async () => {
    let calls = 0;
    const writer: SectionWriter = {
      async write(req) {
        if (req.sectionType === "about") {
          calls++;
          throw new WriterRefusal("declined");
        }
        return new TemplateCopyWriter(intake).write(req);
      },
    };
    await expect(generateSite({ template, pkg: "single_page", intake, writer })).rejects.toBeInstanceOf(GenerationError);
    expect(calls).toBe(1);
  });

  it("limits how many sections are written at once", async () => {
    let active = 0;
    let peak = 0;
    const writer: SectionWriter = {
      async write(req) {
        active++;
        peak = Math.max(peak, active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
        return new TemplateCopyWriter(intake).write(req);
      },
    };
    await generateSite({ template, pkg: "seven_plus_page", intake, writer, concurrency: 2 });
    expect(peak).toBe(2);
  });
});

describe("prompts", () => {
  it("keeps the system prompt free of site details so it caches", async () => {
    const writer = new Recorder();
    await generateSite({ template, pkg: "five_page", intake, writer });
    expect(new Set(writer.requests.map((r) => r.system))).toEqual(new Set([SYSTEM_PROMPT]));
    expect(SYSTEM_PROMPT).not.toContain("Smith");
  });

  it("puts intake facts and template voice in the section prompt", () => {
    const p = buildSectionPrompt({ template, intake, pageTitle: "Home", sectionType: "hero" });
    expect(p).toContain("Smith Plumbing");
    expect(p).toContain("Austin, TX");
    expect(p).toContain(template.voice);
    expect(p).toContain("Do you offer emergency service?");
  });
});

describe("primaryHref", () => {
  it("routes the main button by action", () => {
    expect(primaryHref(intake, "five_page")).toBe("tel:5125550142");
    expect(primaryHref({ ...intake, primaryAction: "quote" }, "single_page")).toBe("#contact");
    expect(primaryHref({ ...intake, primaryAction: "quote" }, "five_page")).toBe("/contact");
    expect(primaryHref({ ...intake, primaryAction: "book", bookingUrl: "https://cal.example/smith" }, "five_page")).toBe("https://cal.example/smith");
    expect(primaryHref({ ...intake, primaryAction: "book" }, "five_page")).toBe("tel:5125550142");
  });
});

describe("style extras", () => {
  it("fills highlights and community from intake and writes steps with the AI", async () => {
    const withCommunity = Intake.parse({ ...intake, community: [{ title: "Food drive", summary: "We collected 2,000 cans." }] });
    const writer = new Recorder();
    const flow = await generateSite({ template: getTemplate("flow")!, pkg: "five_page", intake: withCommunity, writer });
    const home = flow.site.pages[0]!.sections.map((s) => s.type);
    expect(home).toContain("steps");
    expect(home).toContain("highlights");
    expect(writer.requests.map((r) => r.sectionType)).toContain("steps");
    expect(writer.requests.map((r) => r.sectionType)).not.toContain("highlights");

    const hometown = await generateSite({ template: getTemplate("hometown")!, pkg: "five_page", intake: withCommunity, writer: new TemplateCopyWriter(withCommunity) });
    const community = hometown.site.pages[0]!.sections.find((s) => s.type === "community");
    expect(community?.props).toMatchObject({ items: [{ title: "Food drive" }] });
  });

  it("skips community and highlights when intake has none", async () => {
    const bare = Intake.parse({ ...intake, highlights: [], community: [] });
    const { site, skipped } = await generateSite({ template: getTemplate("hometown")!, pkg: "five_page", intake: bare, writer: new TemplateCopyWriter(bare) });
    const types = site.pages[0]!.sections.map((s) => s.type);
    expect(types).not.toContain("community");
    expect(types).not.toContain("highlights");
    expect(skipped.map((s) => s.type)).toEqual(expect.arrayContaining(["community", "highlights"]));
  });
});

describe("photos and local facts", () => {
  it("adds intake photos and the secondary hero link", async () => {
    const photos = Intake.parse({
      ...intake,
      photos: { hero: { assetId: "h1", alt: "Van" }, about: { assetId: "a1", alt: "Team" }, gallery: [{ assetId: "g1", alt: "Job" }] },
    });
    const { site } = await generateSite({ template: getTemplate("signature")!, pkg: "single_page", intake: photos, writer: new TemplateCopyWriter(photos) });
    const sections = site.pages[0]!.sections;
    const hero = sections.find((s) => s.type === "hero");
    expect(hero?.props).toMatchObject({ image: { assetId: "h1" }, secondaryCtaHref: "#services" });
    expect(sections.find((s) => s.type === "about")?.props).toMatchObject({ image: { assetId: "a1" } });
    expect(sections.find((s) => s.type === "gallery")?.props).toMatchObject({ images: [{ assetId: "g1" }] });
  });

  it("lists service areas from the business and skips them when there are none", async () => {
    const withAreas = Intake.parse({ ...intake, business: { ...intake.business, serviceAreas: ["Round Rock", "Pflugerville"] } });
    const a = await generateSite({ template: getTemplate("hometown")!, pkg: "single_page", intake: withAreas, writer: new TemplateCopyWriter(withAreas) });
    expect(a.site.pages[0]!.sections.find((s) => s.type === "areas")?.props).toMatchObject({ areas: ["Round Rock", "Pflugerville"] });
    const b = await generateSite({ template: getTemplate("hometown")!, pkg: "single_page", intake, writer: new TemplateCopyWriter(intake) });
    expect(b.skipped.map((s) => s.type)).toContain("areas");
  });
});
