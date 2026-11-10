import { describe, expect, it } from "vitest";
import { buildTicketFromOrder, Order, orderExternalId } from "../src/orders";

const base = {
  id: "8f2b1c1e-1d2a-4c55-9a51-6c0f2b3a4d5e",
  rep: { name: "Jermal Smith", email: "jermal@velolink.example" },
  customer: { name: "Mike Smith", email: "mike@smithplumbing.example", phone: "(512) 555-0142" },
  intake: { business: { name: "Smith Plumbing", phone: "(512) 555-0142" }, industry: "plumbing", services: ["Leak repair", "Water heaters"] },
  package: "five_page",
  templateId: "momentum",
  receptionist: { voice: "Ava" },
  maintenancePlan: true,
  domain: { option: "purchase", name: "smithplumbingatx.com", feeCents: 2500 },
  payment: { status: "paid", amountCents: 149900, stripeInvoiceId: "in_123", stripeInvoiceUrl: "https://invoice.stripe.com/i/abc" },
} as const;

describe("buildTicketFromOrder", () => {
  const t = buildTicketFromOrder(Order.parse(base));

  it("titles the ticket with the business and package", () => {
    expect(t.subject).toBe("New website order: Smith Plumbing (5 page)");
  });

  it("assigns the rep and makes the customer the requester", () => {
    expect(t.assigneeEmail).toBe("jermal@velolink.example");
    expect(t.requester).toEqual({ name: "Mike Smith", email: "mike@smithplumbing.example" });
  });

  it("lists what was sold, with the invoice link", () => {
    expect(t.htmlBody).toContain('<th align="left">AI receptionist</th><td>Yes, voice: Ava</td>');
    expect(t.htmlBody).toContain("Buy for customer: smithplumbingatx.com (fee $25.00)");
    expect(t.htmlBody).toContain("paid – $1499.00");
    expect(t.htmlBody).toContain('<a href="https://invoice.stripe.com/i/abc">View Stripe invoice</a>');
  });

  it("tags the ticket so Zendesk triggers can route it", () => {
    expect(t.tags).toEqual([
      "velolink_order",
      "velolink_pkg_five_page",
      "velolink_tpl_momentum",
      "velolink_payment_paid",
      "velolink_receptionist",
      "velolink_maintenance",
      "velolink_domain_purchase",
    ]);
  });

  it("uses a stable external id so a retry finds the same ticket", () => {
    expect(t.externalId).toBe(orderExternalId(base.id));
    expect(buildTicketFromOrder(Order.parse(base)).externalId).toBe(t.externalId);
  });

  it("escapes anything a rep or customer typed", () => {
    const evil = buildTicketFromOrder(Order.parse({ ...base, notes: '<img src=x onerror="alert(1)">' }));
    expect(evil.htmlBody).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(evil.htmlBody).not.toContain("<img");
  });

  it("only accepts https invoice links", () => {
    expect(Order.safeParse({ ...base, payment: { ...base.payment, stripeInvoiceUrl: "javascript:alert(1)" } }).success).toBe(false);
  });
});
