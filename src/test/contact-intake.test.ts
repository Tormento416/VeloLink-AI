import { describe, expect, it } from "vitest";
import { bookingRequestSchema, contactInquirySchema, intakeRouting } from "@/lib/contact-schema";

const inquiry = {
  name: "Jordan Owner", business: "Jordan Plumbing", email: "jordan@example.com", phone: "",
  topic: "Website revamp", message: "We need a faster one-page website.", website: "",
};

describe("Public contact inquiry rules", () => {
  it("accepts the required concise summary fields", () => {
    expect(contactInquirySchema.safeParse(inquiry).success).toBe(true);
  });
  it("requires name, business, email, topic, and message", () => {
    for (const field of ["name", "business", "email", "topic", "message"] as const) {
      expect(contactInquirySchema.safeParse({ ...inquiry, [field]: "" }).success).toBe(false);
    }
  });
  it("rejects forged routing or credential fields", () => {
    expect(contactInquirySchema.safeParse({ ...inquiry, notification_email: "attacker@example.com" }).success).toBe(false);
    expect(contactInquirySchema.safeParse({ ...inquiry, api_key: "forged" }).success).toBe(false);
  });
  it("keeps public and private routing separate", () => {
    expect(intakeRouting.publicEmail).toBe("sales@velolinkai.com");
    expect(intakeRouting.inquiryNotification).toBe("hyrlink.admin@hyrlink.app");
    expect(intakeRouting.bookingReview).toBe("asousa@hyrlink.app");
  });
});

describe("Booking request rules", () => {
  const booking = {
    name: "Jordan Owner", business: "Jordan Plumbing", email: "jordan@example.com", phone: "555-0100",
    requested_window: "Tuesday afternoon", timezone: "America/New_York", reason: "Website review",
  };
  it("accepts a preferred window and timezone without claiming confirmation", () => {
    const parsed = bookingRequestSchema.safeParse(booking);
    expect(parsed.success).toBe(true);
  });
  it("requires a requested window, timezone, and reason", () => {
    for (const field of ["requested_window", "timezone", "reason"] as const) {
      expect(bookingRequestSchema.safeParse({ ...booking, [field]: "" }).success).toBe(false);
    }
  });
  it("rejects rep assignment or calendar-event forgery from visitors", () => {
    expect(bookingRequestSchema.safeParse({ ...booking, assigned_rep: "rep@example.com" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...booking, calendar_event_id: "forged" }).success).toBe(false);
  });
});
