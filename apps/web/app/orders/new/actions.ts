"use server";

import { parseOrderForm } from "../../../lib/order-form";
import { currentRep } from "../../../lib/reps";
import { zendeskFromEnv, ZendeskError } from "../../../lib/zendesk";

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: Record<string, string> }
  | { status: "sent"; ticketId: number; created: boolean };

/** Validates the order and sends it to Zendesk. Resubmitting the same form reuses its ticket. */
export async function submitOrder(_prev: SubmitState, form: FormData): Promise<SubmitState> {
  const rep = await currentRep();
  if (!rep) return { status: "error", message: "Please sign in as a rep before sending an order.", errors: {} };

  const parsed = parseOrderForm(form, rep);
  if (!parsed.ok) return { status: "error", message: "Please fix the highlighted fields.", errors: parsed.errors };

  const zendesk = zendeskFromEnv();
  if (!zendesk) return { status: "error", message: "Zendesk isn't configured on this deployment.", errors: {} };

  try {
    const res = await zendesk.pushOrder(parsed.order);
    return { status: "sent", ticketId: res.ticketId, created: res.created };
  } catch (err) {
    // Log the status only; Zendesk error bodies can echo customer details.
    console.error("Zendesk push failed", err instanceof ZendeskError ? err.message : "unexpected error");
    return { status: "error", message: "Zendesk didn't accept the order. Nothing was lost: try again in a minute.", errors: {} };
  }
}
