import type { Template } from "../templates";

/** Single-page template for local service businesses. */
export const localProSingle: Template = {
  id: "local-pro-single",
  version: 1,
  name: "Local Pro (single page)",
  package: "single_page",
  themeId: "clean-blue",
  pages: [
    {
      slug: "",
      title: "Home",
      sections: [
        { type: "hero", variant: "split", guidance: "Name the main service and service area. CTA is to call or book." },
        { type: "services", variant: "grid", guidance: "List the client's services only, one plain sentence each." },
        { type: "about", variant: "text", guidance: "Who runs the business and why customers trust them. Facts from intake only." },
        { type: "reviews", variant: "cards", guidance: "Use only reviews supplied at intake. Omit the section if none." },
        { type: "faq", variant: "accordion", guidance: "Answer common questions using intake facts: pricing approach, area, hours." },
        { type: "contact", variant: "details", guidance: "Phone, email, address and hours exactly as given at intake." },
      ],
    },
  ],
};
