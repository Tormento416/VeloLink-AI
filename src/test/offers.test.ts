import { describe, expect, it } from "vitest";
import { websiteRevamp, websiteAddOns, normalizeBundle, bundleRequest } from "@/lib/offers";

describe("Standalone website offer", () => {
  it("starts at $500", () => {
    expect(websiteRevamp.startingPrice).toBe(500);
  });
  it("covers one page", () => {
    expect(websiteRevamp.pages).toBe(1);
  });
  it("does not require an AI receptionist", () => {
    expect(websiteRevamp.includesAiReceptionist).toBe(false);
  });
  it.each(["extra-pages", "ai-receptionist", "seo-engine", "video-backgrounds", "image-slideshows"])("offers %s separately", (id) => {
    expect(websiteAddOns.some((addOn) => addOn.id === id)).toBe(true);
  });
});

describe("À la carte bundles", () => {
  it("preserves independently selected services without forcing AI", () => {
    expect(normalizeBundle("seo-engine,image-slideshows")).toEqual(["seo-engine", "image-slideshows"]);
  });
  it("removes duplicates and unknown options", () => {
    expect(normalizeBundle("seo-engine,unknown,seo-engine")).toEqual(["seo-engine"]);
  });
  it("carries chosen services into the quote request", () => {
    const request = bundleRequest(["ai-receptionist", "video-backgrounds"]);
    expect(request).toContain("AI receptionist, Video backgrounds");
    expect(request).not.toContain("SEO engine");
  });
});