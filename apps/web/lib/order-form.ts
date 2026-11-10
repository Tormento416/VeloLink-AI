// Turns the rep order form into a validated Order. Pure, so it is tested without a browser.
import { Order, SOCIAL_NETWORKS, type OrderInput } from "@velolink/core";

export type Rep = { name: string; email: string };

export type OrderFormResult = { ok: true; order: Order } | { ok: false; errors: Record<string, string> };

const str = (form: FormData, key: string): string | undefined => {
  const v = form.get(key);
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? undefined : s;
};

/** One entry per non-empty line. */
const lines = (form: FormData, key: string): string[] =>
  (str(form, key) ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/** Splits "a | b | c" into trimmed parts. */
const parts = (line: string) => line.split("|").map((p) => p.trim());

/** Dollars typed by a rep ("1,499" or "1499.00") to whole cents, or NaN when it isn't a number. */
export function dollarsToCents(input: string | undefined): number {
  if (input === undefined) return 0;
  const clean = input.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return Number.NaN;
  return Math.round(Number(clean) * 100);
}

const SOCIAL_HOSTS: Record<string, (typeof SOCIAL_NETWORKS)[number]> = {
  "facebook.com": "facebook",
  "instagram.com": "instagram",
  "tiktok.com": "tiktok",
  "x.com": "x",
  "twitter.com": "x",
  "youtube.com": "youtube",
  "linkedin.com": "linkedin",
  "nextdoor.com": "nextdoor",
  "g.page": "google",
  "google.com": "google",
};

/** Works out the network from a profile URL, or null for a site we don't show. */
export function socialNetwork(url: string): (typeof SOCIAL_NETWORKS)[number] | null {
  try {
    const host = new URL(url).hostname.replace(/^www\.|^m\./, "");
    return SOCIAL_HOSTS[host] ?? null;
  } catch {
    return null;
  }
}

/** Builds the order from the form. The rep comes from the signed-in session, never from the form. */
export function parseOrderForm(form: FormData, rep: Rep): OrderFormResult {
  const errors: Record<string, string> = {};

  const social = lines(form, "social").flatMap((href) => {
    const network = socialNetwork(href);
    if (!network) {
      errors.social = `Not a supported social profile: ${href}`;
      return [];
    }
    return [{ network, href }];
  });

  const reviews = lines(form, "reviews").map((l) => {
    const [author = "", rating = "", ...quote] = parts(l);
    return { author, rating: Number(rating), quote: quote.join(" | ") };
  });

  const amountCents = dollarsToCents(str(form, "amount"));
  if (Number.isNaN(amountCents)) errors.amount = "Enter the price in dollars, e.g. 1499";
  const feeCents = dollarsToCents(str(form, "domainFee"));
  if (Number.isNaN(feeCents)) errors.domainFee = "Enter the fee in dollars, e.g. 25";

  const domainOption = str(form, "domainOption");
  const domainName = str(form, "domainName");
  const voice = str(form, "voice");

  const input: OrderInput = {
    id: str(form, "orderId") ?? "",
    rep,
    customer: { name: str(form, "customerName") ?? "", email: str(form, "customerEmail") ?? "", phone: str(form, "customerPhone") },
    intake: {
      business: {
        name: str(form, "businessName") ?? "",
        phone: str(form, "businessPhone") ?? "",
        email: str(form, "businessEmail"),
        address: str(form, "address"),
        serviceArea: str(form, "serviceArea"),
        serviceAreas: (str(form, "serviceAreas") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
        tagline: str(form, "tagline"),
        hours: lines(form, "hours").map((l) => {
          const [days = "", time = ""] = parts(l);
          return { days, time };
        }),
        social,
      },
      industry: str(form, "industry") ?? "",
      services: lines(form, "services"),
      story: str(form, "story"),
      highlights: lines(form, "highlights"),
      reviews,
      faqs: lines(form, "faqs").map((l) => {
        const [question = "", ...answer] = parts(l);
        const a = answer.join(" | ");
        return a ? { question, answer: a } : { question };
      }),
      primaryAction: (str(form, "primaryAction") ?? "call") as "call" | "book" | "quote",
      bookingUrl: str(form, "bookingUrl"),
      notes: str(form, "copyNotes"),
    },
    package: (str(form, "package") ?? "") as OrderInput["package"],
    templateId: str(form, "templateId") ?? "",
    receptionist: form.get("receptionist") === "on" ? { voice: voice ?? "" } : undefined,
    maintenancePlan: form.get("maintenance") === "on",
    domain:
      domainOption === "purchase"
        ? { option: "purchase", name: domainName, feeCents: Number.isNaN(feeCents) ? 0 : feeCents }
        : { option: "existing", name: domainName ?? "" },
    // Stripe marks the order paid later; the form never claims payment.
    payment: { status: "unpaid", amountCents: Number.isNaN(amountCents) ? 0 : amountCents },
    notes: str(form, "notes"),
  };

  const parsed = Order.safeParse(input);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = fieldForPath(issue.path.map(String));
      errors[key] ??= issue.message;
    }
  }
  if (Object.keys(errors).length > 0 || !parsed.success) return { ok: false, errors };
  return { ok: true, order: parsed.data };
}

/** Maps a schema path to the form field that shows the error. */
function fieldForPath(path: string[]): string {
  const [a, b, c] = path;
  if (a === "customer") return { name: "customerName", email: "customerEmail", phone: "customerPhone" }[b ?? ""] ?? "customerName";
  if (a === "domain") return b === "feeCents" ? "domainFee" : "domainName";
  if (a === "receptionist") return "voice";
  if (a === "payment") return "amount";
  if (a === "id") return "form";
  if (a === "intake") {
    if (b === "business") {
      const map: Record<string, string> = { name: "businessName", phone: "businessPhone", email: "businessEmail" };
      return map[c ?? ""] ?? c ?? "businessName";
    }
    if (b === "notes") return "copyNotes";
    return b ?? "form";
  }
  return a ?? "form";
}
