import { Site, THEMES, type Template } from "@velolink/core";

/** Sample content used to preview a template before any client data exists. */
export function demoSiteFor(template: Template): Site {
  const theme = THEMES[template.themeId];
  if (!theme) throw new Error(`Unknown theme ${template.themeId}`);
  return Site.parse({
    business: { name: "Smith Plumbing", phone: "(512) 555-0142", serviceArea: "Austin, TX" },
    theme,
    templateId: template.id,
    templateVersion: template.version,
    pages: template.pages.map((p) => ({
      slug: p.slug,
      title: p.title,
      sections: p.sections.map((s) => sampleSection(s.type)),
    })),
  });
}

function sampleSection(type: string) {
  switch (type) {
    case "hero":
      return { type, props: { headline: "Fast, honest plumbing in Austin", subheadline: "Licensed plumbers, same-day service.", ctaLabel: "Call now", ctaHref: "tel:+15125550142" } };
    case "services":
      return { type, props: { heading: "Services", items: [{ name: "Leak repair", description: "Find and fix leaks fast." }, { name: "Water heaters", description: "Repair and install." }, { name: "Drain cleaning", description: "Clear clogs without the mess." }] } };
    case "about":
      return { type, props: { heading: "About us", body: "Family owned since 2009, serving Austin homes and businesses." } };
    case "reviews":
      return { type, props: { heading: "What customers say", items: [{ author: "Dana R.", quote: "On time and fairly priced.", rating: 5 }] } };
    case "faq":
      return { type, props: { heading: "Questions", items: [{ question: "Do you offer emergency service?", answer: "Yes, 24/7 across Austin." }] } };
    case "contact":
      return { type, props: { heading: "Get in touch", phone: "(512) 555-0142", hours: [{ days: "Mon–Fri", time: "7am–6pm" }] } };
    default:
      return { type: "cta", props: { heading: "Ready to book?", ctaLabel: "Call now", ctaHref: "tel:+15125550142" } };
  }
}
