// Server code only. Who is submitting an order.
import type { Rep } from "./order-form";

/**
 * The signed-in rep, or null when nobody is signed in.
 * Rep sign-in is not wired up yet, so this always returns null and orders are refused.
 * That keeps the form from creating Zendesk tickets for anyone who finds the URL.
 */
export async function currentRep(): Promise<Rep | null> {
  return null;
}
