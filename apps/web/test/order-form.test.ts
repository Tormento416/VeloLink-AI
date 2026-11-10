import { describe, expect, it } from "vitest";
import { dollarsToCents, parseOrderForm, socialNetwork } from "../lib/order-form";

const rep = { name: "Jermal Smith", email: "jermal@velolink.example" };

function form(fields: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const valid = {
  orderId: "8f2b1c1e-1d2a-4c55-9a51-6c0f2b3a4d5e",
  customerName: "Mike Smith",
  customerEmail: "mike@smithplumbing.example",
  businessName: "Smith Plumbing",
  businessPhone: "(512) 555-0142",
  industry: "residential plumbing",
  services: "Leak repair\n\nWater heaters\n",
  serviceAreas: "Austin, Round Rock , ",
  hours: "Mon–Fri | 8am–6pm",
  social: "https://www.facebook.com/smithplumbing",
  reviews: "Dana R. | 5 | Fixed our leak in an hour",
  faqs: "Do you do emergencies? | Yes, 24/7\nAre you licensed?",
  package: "five_page",
  templateId: "momentum",
  amount: "$1,499",
  domainOption: "existing",
  domainName: "smithplumbing.com",
};

describe("parseOrderForm", () => {
  it("builds an unpaid order for the signed-in rep", () => {
    const res = parseOrderForm(form(valid), rep);
    if (!res.ok) throw new Error(JSON.stringify(res.errors));
    const o = res.order;
    expect(o.rep).toEqual(rep);
    expect(o.payment).toEqual({ status: "unpaid", amountCents: 149900 });
    expect(o.intake.services).toEqual(["Leak repair", "Water heaters"]);
    expect(o.intake.business.serviceAreas).toEqual(["Austin", "Round Rock"]);
    expect(o.intake.business.hours).toEqual([{ days: "Mon–Fri", time: "8am–6pm" }]);
    expect(o.intake.business.social).toEqual([{ network: "facebook", href: "https://www.facebook.com/smithplumbing" }]);
    expect(o.intake.reviews).toEqual([{ author: "Dana R.", rating: 5, quote: "Fixed our leak in an hour" }]);
    expect(o.intake.faqs).toEqual([{ question: "Do you do emergencies?", answer: "Yes, 24/7" }, { question: "Are you licensed?" }]);
    expect(o.domain).toEqual({ option: "existing", name: "smithplumbing.com" });
    expect(o.receptionist).toBeUndefined();
    expect(o.maintenancePlan).toBe(false);
  });

  it("ignores a rep or payment status smuggled into the form", () => {
    const res = parseOrderForm(form({ ...valid, rep: "someone@else.example", paymentStatus: "paid" }), rep);
    expect(res.ok && res.order.rep.email).toBe("jermal@velolink.example");
    expect(res.ok && res.order.payment.status).toBe("unpaid");
  });

  it("adds the receptionist and a domain purchase with its fee", () => {
    const res = parseOrderForm(form({ ...valid, receptionist: "on", voice: "Ava", maintenance: "on", domainOption: "purchase", domainName: "", domainFee: "25" }), rep);
    if (!res.ok) throw new Error(JSON.stringify(res.errors));
    expect(res.order.receptionist).toEqual({ voice: "Ava" });
    expect(res.order.maintenancePlan).toBe(true);
    expect(res.order.domain).toEqual({ option: "purchase", feeCents: 2500 });
  });

  it("points each problem at its field", () => {
    const res = parseOrderForm(form({ ...valid, customerEmail: "nope", services: "", amount: "lots", social: "https://myspace.com/x" }), rep);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(Object.keys(res.errors).sort()).toEqual(["amount", "customerEmail", "services", "social"]);
    expect(res.errors.amount).toBe("Enter the price in dollars, e.g. 1499");
    expect(res.errors.social).toBe("Not a supported social profile: https://myspace.com/x");
  });

  it("requires a voice when the receptionist is sold", () => {
    const res = parseOrderForm(form({ ...valid, receptionist: "on" }), rep);
    expect(res.ok).toBe(false);
    expect(!res.ok && Object.keys(res.errors)).toEqual(["voice"]);
  });
});

describe("helpers", () => {
  it("reads dollars as cents", () => {
    expect(dollarsToCents("1,499")).toBe(149900);
    expect(dollarsToCents("$25.5")).toBe(2550);
    expect(dollarsToCents(undefined)).toBe(0);
    expect(dollarsToCents("12.345")).toBeNaN();
  });

  it("recognises social networks by host", () => {
    expect(socialNetwork("https://m.facebook.com/x")).toBe("facebook");
    expect(socialNetwork("https://twitter.com/x")).toBe("x");
    expect(socialNetwork("not a url")).toBeNull();
  });
});
