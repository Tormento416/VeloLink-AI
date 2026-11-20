import { describe, expect, it } from "vitest";
import { repBuilderSchema, quoteHandoff } from "@/lib/builder-schema";
import { isAllowedRep } from "@/lib/rep-policy.server";

const repInput = {
  business_name: "Test Plumbing", existing_url: "https://example.com", description: "Local plumbing",
  industry: "Plumbing", service_area: "Charlotte", contact_name: "Test Owner", contact_email: "owner@example.com",
  contact_phone: "", site_info: "", template: "service", color_scheme: "navy-teal",
  scope: "single", page_count: 1, pages: ["Home"], payment_preference: "one-time", vapi: { enabled: false, model: "", voice_tier: "Base", monthly_minutes: null },
};

describe("Strict rep quote inputs", () => {
  it("rejects malformed or credential-bearing website URLs", () => {
    expect(repBuilderSchema.safeParse({ ...repInput, existing_url: "https://" }).success).toBe(false);
    expect(repBuilderSchema.safeParse({ ...repInput, existing_url: "https://user:password@example.com" }).success).toBe(false);
  });
  it.each(["source", "price_id", "price", "rep_user_id", "rep_email"])("rejects forged attribution or pricing field %s", (field) => {
    expect(repBuilderSchema.safeParse({ ...repInput, [field]: "forged" }).success).toBe(false);
  });
  it("does not confirm pricing or pretend checkout succeeded", () => {
    expect(quoteHandoff.checkout).toEqual({ state: "quote_only", price_id: null, checkout_url: null });
    expect(quoteHandoff.pricing_status).toBe("pending_confirmation");
    expect(quoteHandoff.provisioning).toBe("after_confirmation");
  });
});

describe("Rep rules", () => {
  it("denies rep access when the allowlist is unset or empty", () => {
    expect(isAllowedRep("rep@example.com", true, undefined)).toBe(false);
    expect(isAllowedRep("rep@example.com", true, " , ")).toBe(false);
  });
  it("denies users not exactly listed", () => {
    expect(isAllowedRep("other@example.com", true, "rep@example.com")).toBe(false);
    expect(isAllowedRep("rep@example.com.attacker.test", true, "rep@example.com")).toBe(false);
  });
  it("requires a verified email", () => {
    expect(isAllowedRep("rep@example.com", false, "rep@example.com")).toBe(false);
  });
  it("matches verified allowlisted emails case-insensitively with whitespace", () => {
    expect(isAllowedRep("REP@example.com", true, " other@example.com, rep@example.com ")).toBe(true);
  });
  it("validates rep multi-page count against the page list", () => {
    const rep = { ...repInput, scope: "multi", page_count: 2, pages: ["Home", "Services"], payment_preference: "subscription", vapi: { enabled: true, model: "", voice_tier: "Premium", monthly_minutes: 500 } };
    expect(repBuilderSchema.safeParse(rep).success).toBe(true);
    expect(repBuilderSchema.safeParse({ ...rep, page_count: 3 }).success).toBe(false);
    expect(repBuilderSchema.safeParse({ ...rep, scope: "single" }).success).toBe(false);
  });
});