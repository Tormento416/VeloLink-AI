import { describe, expect, it } from "vitest";

import {
  demoCategories,
  demoRequest,
  demos,
  findDemo,
  normalizeDemo,
} from "@/lib/demos";

describe("Demo showcase data", () => {
  it("covers the categories the owner asked to showcase", () => {
    expect(demoCategories.map((c) => c.id)).toEqual(["legal", "trades", "creative"]);
  });

  it("keeps every demo inside a real category", () => {
    const categoryIds = demoCategories.map((c) => c.id);
    for (const demo of demos) {
      expect(categoryIds).toContain(demo.category);
    }
  });

  it("never presents an unpublished build as a live demo", () => {
    for (const demo of demos) {
      if (demo.status === "live") {
        expect(demo.url).toMatch(/^https:\/\//);
      }
    }
    expect(demos.filter((d) => d.status === "live" && !d.url)).toHaveLength(0);
  });

  it("writes a request that names the demo and its category", () => {
    const demo = findDemo("emergency-plumber");
    expect(demo).toBeDefined();
    const text = demoRequest(demo!);
    expect(text).toContain("Emergency Plumber One-Pager");
    expect(text).toContain("Local Services & Trades");
  });

  it("rejects demo ids that do not exist", () => {
    expect(normalizeDemo("made-up-demo")).toBeUndefined();
    expect(normalizeDemo("emergency-plumber")).toBe("emergency-plumber");
    expect(normalizeDemo(undefined)).toBeUndefined();
  });
});
