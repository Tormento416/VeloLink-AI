import { createServerFn } from "@tanstack/react-start";
import { bookingRequestSchema, contactInquirySchema, intakeRouting } from "./contact-schema";

type StoredIntake = { id: string; notification: "configured" | "email_domain_missing" };

async function insertIntake(table: "contact_inquiries" | "booking_requests", row: Record<string, unknown>): Promise<StoredIntake> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // The row is already produced by the strict schema above; generated insert types are a union here.
  const { data, error } = await supabaseAdmin.from(table).insert(row as never).select("id").single();
  if (error || !data) throw new Error("Your request could not be saved. Please try again.");
  // Lovable's managed app-email sender requires a verified email domain. Until one is
  // configured, the intake remains safely stored and this status drives honest UI/docs.
  return { id: data.id, notification: process.env["LOVABLE_EMAIL_SENDER_DOMAIN"] ? "configured" : "email_domain_missing" };
}

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactInquirySchema.parse(input))
  .handler(async ({ data }) => insertIntake("contact_inquiries", {
    name: data.name, business: data.business, email: data.email, phone: data.phone || null,
    topic: data.topic, message: data.message,
  }));

export const submitBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingRequestSchema.parse(input))
  .handler(async ({ data }) => insertIntake("booking_requests", {
    name: data.name, business: data.business, email: data.email, phone: data.phone || null,
    requested_window: data.requested_window, timezone: data.timezone, reason: data.reason,
    status: "awaiting_confirmation",
  }));

export const intakeDestinations = intakeRouting;
