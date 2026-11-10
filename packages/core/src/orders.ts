import { z } from "zod";
import { Intake } from "./generation/intake";
import { Package } from "./packages";

const PACKAGE_LABELS: Record<Package, string> = { single_page: "Single page", five_page: "5 page", seven_plus_page: "7+ page" };

/** A deal a rep submits. It becomes a Zendesk user (the customer) plus a build ticket. */
export const Order = z.object({
  id: z.uuid(),
  rep: z.object({ name: z.string().trim().min(1).max(120), email: z.email() }),
  customer: z.object({ name: z.string().trim().min(1).max(120), email: z.email(), phone: z.string().trim().max(30).optional() }),
  intake: Intake,
  package: Package,
  templateId: z.string().min(1),
  receptionist: z.object({ voice: z.string().trim().min(1).max(60) }).optional(),
  maintenancePlan: z.boolean().default(false),
  domain: z.discriminatedUnion("option", [
    z.object({ option: z.literal("existing"), name: z.string().trim().min(3).max(253) }),
    z.object({ option: z.literal("purchase"), name: z.string().trim().min(3).max(253).optional(), feeCents: z.number().int().min(0) }),
  ]),
  payment: z.object({
    status: z.enum(["unpaid", "paid", "refunded"]),
    amountCents: z.number().int().min(0),
    stripeInvoiceId: z.string().max(255).optional(),
    stripeInvoiceUrl: z.url({ protocol: /^https$/ }).optional(),
  }),
  notes: z.string().trim().max(2000).optional(),
});
export type Order = z.infer<typeof Order>;
export type OrderInput = z.input<typeof Order>;

/** Zendesk ticket fields for a new build. Pure, so it can be tested without Zendesk. */
export type BuildTicket = {
  subject: string;
  htmlBody: string;
  tags: string[];
  externalId: string;
  requester: { name: string; email: string };
  assigneeEmail: string;
};

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Stable external id: a retried submission finds the same ticket instead of making a new one. */
export function orderExternalId(orderId: string): string {
  return `velolink-order-${orderId}`;
}

export function buildTicketFromOrder(order: Order): BuildTicket {
  const b = order.intake.business;
  const rows: [string, string][] = [
    ["Business", b.name],
    ["Customer", `${order.customer.name} <${order.customer.email}>${order.customer.phone ? `, ${order.customer.phone}` : ""}`],
    ["Sold by", order.rep.name],
    ["Package", PACKAGE_LABELS[order.package]],
    ["Template", order.templateId],
    ["AI receptionist", order.receptionist ? `Yes, voice: ${order.receptionist.voice}` : "No"],
    ["Maintenance plan", order.maintenancePlan ? "Yes" : "No"],
    [
      "Domain",
      order.domain.option === "existing"
        ? `Existing: ${order.domain.name}`
        : `Buy for customer${order.domain.name ? `: ${order.domain.name}` : ""} (fee ${money(order.domain.feeCents)})`,
    ],
    ["Payment", `${order.payment.status} – ${money(order.payment.amountCents)}`],
  ];
  if (order.payment.stripeInvoiceId) rows.push(["Stripe invoice", order.payment.stripeInvoiceId]);

  const table = rows.map(([k, v]) => `<tr><th align="left">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  const invoice = order.payment.stripeInvoiceUrl
    ? `<p><a href="${esc(order.payment.stripeInvoiceUrl)}">View Stripe invoice</a></p>`
    : "";
  const services = `<p><strong>Services:</strong> ${esc(order.intake.services.join(", "))}</p>`;
  const notes = order.notes ? `<p><strong>Rep notes:</strong> ${esc(order.notes)}</p>` : "";

  return {
    subject: `New website order: ${b.name} (${PACKAGE_LABELS[order.package]})`,
    htmlBody: `<p>New website order. The build starts automatically.</p><table>${table}</table>${services}${invoice}${notes}`,
    tags: [
      "velolink_order",
      `velolink_pkg_${order.package}`,
      `velolink_tpl_${order.templateId.replace(/[^a-z0-9_-]/gi, "_")}`,
      `velolink_payment_${order.payment.status}`,
      ...(order.receptionist ? ["velolink_receptionist"] : []),
      ...(order.maintenancePlan ? ["velolink_maintenance"] : []),
      ...(order.domain.option === "purchase" ? ["velolink_domain_purchase"] : []),
    ],
    externalId: orderExternalId(order.id),
    requester: { name: order.customer.name, email: order.customer.email },
    assigneeEmail: order.rep.email,
  };
}
