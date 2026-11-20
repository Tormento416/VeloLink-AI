import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const optionalPhone = text(60).optional().default("");

export const contactInquirySchema = z.object({
  name: text(120).min(1, "Name is required"),
  business: text(120).min(1, "Business is required"),
  email: z.string().trim().email("Use a valid email").max(254),
  phone: optionalPhone,
  topic: text(160).min(1, "Choose a topic"),
  message: text(4000).min(1, "Message is required"),
  website: text(500).optional().default(""),
}).strict();

export const bookingRequestSchema = z.object({
  name: text(120).min(1, "Name is required"),
  business: text(120).min(1, "Business is required"),
  email: z.string().trim().email("Use a valid email").max(254),
  phone: optionalPhone,
  requested_window: text(500).min(1, "Share a date/time or preferred window"),
  timezone: text(120).min(1, "Choose your timezone"),
  reason: text(4000).min(1, "Reason is required"),
}).strict();

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const intakeRouting = {
  publicEmail: "sales@velolinkai.com",
  inquiryNotification: "hyrlink.admin@hyrlink.app",
  bookingReview: "asousa@hyrlink.app",
} as const;
