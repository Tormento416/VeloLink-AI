import type { Site } from "../src/site";
import { THEMES } from "../src/theme";

export const demoSite: Site = {
  business: { name: "Smith Plumbing", phone: "(512) 555-0142", email: "hello@smithplumbing.example", serviceArea: "Austin, TX" },
  theme: THEMES["clean-blue"]!,
  templateId: "clean-pro",
  templateVersion: 1,
  package: "single_page",
  pages: [
    {
      slug: "",
      title: "Home",
      sections: [
        {
          type: "hero",
          variant: "split",
          props: { headline: "Fast, honest plumbing in Austin", subheadline: "Licensed plumbers, same-day service.", ctaLabel: "Call now", ctaHref: "tel:+15125550142" },
        },
        {
          type: "services",
          variant: "grid",
          props: { heading: "Services", items: [{ name: "Leak repair", description: "Find and fix leaks fast." }, { name: "Water heaters", description: "Repair and install." }] },
        },
        {
          type: "contact",
          variant: "details",
          props: { heading: "Get in touch", phone: "(512) 555-0142", hours: [{ days: "Mon–Fri", time: "7am–6pm" }] },
        },
      ],
    },
  ],
};
