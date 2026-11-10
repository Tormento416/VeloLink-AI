import { randomUUID } from "node:crypto";
import { TEMPLATES } from "@velolink/core";
import { OrderForm } from "./order-form";

export const metadata = { title: "New order · VeloLink" };
// A fresh order id per visit, so a double submit reuses the same Zendesk ticket.
export const dynamic = "force-dynamic";

export default function NewOrderPage() {
  return <OrderForm orderId={randomUUID()} templates={TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.description }))} />;
}
