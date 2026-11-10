/** Starting fee for an edit outside the maintenance plan, in cents ($50). */
export const BASE_EDIT_FEE_CENTS = 5000;

export type EditPricingInput = {
  hasMaintenancePlan: boolean;
  isMajor: boolean;
  /** Included edits already used this calendar month. */
  includedEditsUsed: number;
  /** Included edits per month on the customer's plan (1 to 3). */
  includedEditsPerMonth: number;
};

export type EditPricing =
  | { kind: "included" }
  | { kind: "fee"; feeCents: number }
  /** Major changes need a custom quote from the team. */
  | { kind: "quote"; minimumCents: number };

/** Decides whether an edit request is free under the plan, a standard fee, or needs a quote. */
export function priceEdit(input: EditPricingInput): EditPricing {
  const { hasMaintenancePlan, isMajor, includedEditsUsed, includedEditsPerMonth } = input;
  if (!Number.isInteger(includedEditsPerMonth) || includedEditsPerMonth < 0) {
    throw new Error(`includedEditsPerMonth must be a whole number >= 0, got ${includedEditsPerMonth}`);
  }
  if (isMajor) return { kind: "quote", minimumCents: BASE_EDIT_FEE_CENTS };
  if (hasMaintenancePlan && includedEditsUsed < includedEditsPerMonth) return { kind: "included" };
  return { kind: "fee", feeCents: BASE_EDIT_FEE_CENTS };
}
