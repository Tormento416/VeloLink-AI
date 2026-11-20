export const websiteRevamp = {
  name: "One-page website revamp",
  startingPrice: 500,
  pages: 1,
  includesAiReceptionist: false,
} as const;

export const websiteAddOns = [
  { id: "extra-pages", name: "Extra pages", description: "More room for your services, story, and locations." },
  { id: "ai-receptionist", name: "AI receptionist", description: "24/7 call answering, lead capture, and appointment booking." },
  { id: "seo-engine", name: "SEO engine", description: "Search-focused improvements to help customers find your business." },
  { id: "video-backgrounds", name: "Video backgrounds", description: "Bring your website to life with motion." },
  { id: "image-slideshows", name: "Image slideshows", description: "Showcase your work, team, or services with rotating images." },
] as const;

export function formatStartingPrice(price: number) {
  return `$${price.toLocaleString("en-US")}`;
}

export function normalizeBundle(value: unknown): string[] {
  if (typeof value !== "string") return [];
  const ids = value.split(",");
  return websiteAddOns.filter((item) => ids.includes(item.id)).map((item) => item.id);
}

export function bundleRequest(selected: string[], packageName = "") {
  const addOns = websiteAddOns.filter((item) => selected.includes(item.id));
  return [
    packageName ? `I'd like to compare the ${packageName} package with my custom bundle.` : "I'd like a quote for my custom bundle.",
    `${websiteRevamp.name} — starting at ${formatStartingPrice(websiteRevamp.startingPrice)}.`,
    addOns.length ? `Optional add-ons: ${addOns.map((item) => item.name).join(", ")}.` : "Website only; no add-ons selected.",
    "Please confirm setup costs, any monthly fees, and whether a package would save me money.",
  ].join("\n");
}