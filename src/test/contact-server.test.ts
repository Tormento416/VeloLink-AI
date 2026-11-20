import { afterEach, describe, expect, it, vi } from "vitest";
const { insert } = vi.hoisted(() => ({ insert: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: () => ({ insert }) } }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let validate: (input: unknown) => unknown = (input) => input;
    const chain = {
      inputValidator(fn: typeof validate) { validate = fn; return chain; },
      handler(fn: (args: { data: unknown }) => unknown) { return async (args: { data?: unknown } = {}) => fn({ data: validate(args.data) }); },
    };
    return chain;
  },
}));
import { submitBookingRequest, submitContactInquiry } from "@/lib/contact.functions";

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });

describe("Public intake server storage", () => {
  it("stores only validated inquiry fields and reports missing email setup honestly", async () => {
    insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "inquiry-id" }, error: null }) }) });
    await expect(submitContactInquiry({ data: {
      name: "Jordan", business: "Jordan Plumbing", email: "jordan@example.com", phone: "", topic: "Website revamp", message: "Need a faster site.", website: "", notification_email: "attacker@example.com",
    } })).rejects.toThrow();
    expect(insert).not.toHaveBeenCalled();
    const result = await submitContactInquiry({ data: {
      name: "Jordan", business: "Jordan Plumbing", email: "jordan@example.com", phone: "", topic: "Website revamp", message: "Need a faster site.", website: "",
    } });
    expect(result).toEqual({ id: "inquiry-id", notification: "email_domain_missing" });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ email: "jordan@example.com", topic: "Website revamp" }));
    expect(insert).not.toHaveBeenCalledWith(expect.objectContaining({ notification_email: expect.anything() }));
  });
  it("stores booking requests as awaiting confirmation, never as calendar events", async () => {
    insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "booking-id" }, error: null }) }) });
    const result = await submitBookingRequest({ data: {
      name: "Jordan", business: "Jordan Plumbing", email: "jordan@example.com", phone: "", requested_window: "Tuesday afternoon", timezone: "America/New_York", reason: "Website review",
    } });
    expect(result.id).toBe("booking-id");
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ status: "awaiting_confirmation", requested_window: "Tuesday afternoon" }));
    expect(insert).not.toHaveBeenCalledWith(expect.objectContaining({ calendar_event_id: expect.anything() }));
  });
});
