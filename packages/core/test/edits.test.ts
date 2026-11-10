import { describe, expect, it } from "vitest";
import { priceEdit, BASE_EDIT_FEE_CENTS } from "../src/edits";

const plan = { hasMaintenancePlan: true, isMajor: false, includedEditsUsed: 0, includedEditsPerMonth: 3 };

describe("priceEdit", () => {
  it("includes small edits on the maintenance plan until the monthly allowance is used", () => {
    expect(priceEdit({ ...plan, includedEditsUsed: 2 })).toEqual({ kind: "included" });
    expect(priceEdit({ ...plan, includedEditsUsed: 3 })).toEqual({ kind: "fee", feeCents: 5000 });
  });

  it("charges the $50 base fee without a plan", () => {
    expect(priceEdit({ ...plan, hasMaintenancePlan: false })).toEqual({ kind: "fee", feeCents: BASE_EDIT_FEE_CENTS });
  });

  it("sends major changes to a quote, even on the plan", () => {
    expect(priceEdit({ ...plan, isMajor: true })).toEqual({ kind: "quote", minimumCents: 5000 });
  });

  it("rejects an invalid allowance", () => {
    expect(() => priceEdit({ ...plan, includedEditsPerMonth: -1 })).toThrow("includedEditsPerMonth must be a whole number >= 0, got -1");
  });
});
