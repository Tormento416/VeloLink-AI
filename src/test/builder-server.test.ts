import { afterEach, describe, expect, it, vi } from "vitest";
const { verifiedRep, insert, select, eq, order, limit } = vi.hoisted(() => ({ verifiedRep: vi.fn(), insert: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn() }));
vi.mock("@/lib/rep-auth.server", () => ({ verifiedRep }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: (table: string) => table === "rep_identities" ? {
  upsert: () => ({ select: () => ({ single: async () => ({ data: { id: "mapped-owner" }, error: null }) }) }),
  select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: "mapped-owner" }, error: null }) }) }),
} : ({ insert, select }) } }));
// Execute the declared server validator/middleware/handler chain without RPC transport.
vi.mock("@tanstack/react-start", () => ({
  createMiddleware: () => ({ server: (fn: unknown) => fn }),
  createServerFn: () => {
    let validate: (input: unknown) => unknown = (input) => input;
    let middleware: Array<(args: { next: (args: { context: object }) => unknown }) => unknown> = [];
    const chain = {
      inputValidator(fn: typeof validate) { validate = fn; return chain; },
      middleware(fns: typeof middleware) { middleware = fns; return chain; },
      handler(fn: (args: { data: unknown; context: object }) => unknown) {
        return async (args: { data?: unknown } = {}) => {
          const data = validate(args.data);
          async function run(index: number, context: object): Promise<unknown> {
            const guard = middleware[index];
            return guard ? guard({ next: ({ context: added }) => run(index + 1, { ...context, ...added }) }) : fn({ data, context });
          }
          return run(0, {});
        };
      },
    };
    return chain;
  },
}));
import { getRepAccess, listRepQuotes, submitRepQuote } from "@/lib/builder.functions";

const common = { business_name: "Server test", existing_url: "", description: "A service business", industry: "HVAC", service_area: "Charlotte", contact_name: "Owner", contact_email: "owner@example.com", contact_phone: "", site_info: "", template: "service", color_scheme: "navy-teal", scope: "single", page_count: 1, pages: ["Home"], payment_preference: "one-time" };
afterEach(() => { vi.resetAllMocks(); });
describe("Quote server action boundaries", () => {
  it.each([1, 2])("denies anonymous submissions even for %s pages", async (page_count) => {
    verifiedRep.mockResolvedValue(null);
    await expect(submitRepQuote({ data: { ...common, scope: page_count === 1 ? "single" : "multi", page_count, pages: page_count === 1 ? ["Home"] : ["Home", "Services"], vapi: { enabled: false, model: "", voice_tier: "Base", monthly_minutes: null } } })).rejects.toThrow("Rep access denied");
    expect(insert).not.toHaveBeenCalled();
  });
  it("returns no workspace authorization for an anonymous or unauthorized visitor", async () => {
    verifiedRep.mockResolvedValue(null);
    expect(await getRepAccess()).toEqual({ allowed: false, email: null });
    expect(select).not.toHaveBeenCalled();
  });
  it("rejects forged public source and prices even for authorized reps", async () => {
    verifiedRep.mockResolvedValue({ userId: "verified-owner", email: "rep@example.com" });
    await expect(submitRepQuote({ data: { ...common, source: "public", price_id: "forged", vapi: { enabled: false, model: "", voice_tier: "Base", monthly_minutes: null } } })).rejects.toThrow();
    expect(insert).not.toHaveBeenCalled();
  });
  it("denies rep submissions before storage when authorization fails", async () => {
    verifiedRep.mockResolvedValue(null);
    await expect(submitRepQuote({ data: { ...common, vapi: { enabled: false, model: "", voice_tier: "Base", monthly_minutes: null } } })).rejects.toThrow("Rep access denied");
    expect(insert).not.toHaveBeenCalled();
  });
  it("denies rep reads when authorization fails", async () => {
    verifiedRep.mockResolvedValue(null);
    await expect(listRepQuotes()).rejects.toThrow("Rep access denied");
    expect(select).not.toHaveBeenCalled();
  });
  it("scopes rep reads to the verified user ID", async () => {
    verifiedRep.mockResolvedValue({ userId: "verified-owner", email: "rep@example.com" });
    select.mockReturnValue({ eq }); eq.mockReturnValue({ eq, order }); order.mockReturnValue({ limit }); limit.mockResolvedValue({ data: [], error: null });
    expect(await listRepQuotes()).toEqual([]);
    expect(eq).toHaveBeenCalledWith("rep_user_id", "mapped-owner");
    expect(eq).toHaveBeenCalledWith("source", "rep");
  });
  it("writes rep attribution only from verified identity", async () => {
    verifiedRep.mockResolvedValue({ userId: "verified-owner", email: "rep@example.com" });
    insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "saved-id" }, error: null }) }) });
    await submitRepQuote({ data: { ...common, vapi: { enabled: false, model: "", voice_tier: "Base", monthly_minutes: null } } });
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ rep_user_id: "mapped-owner", rep_email: "rep@example.com", source: "rep" }));
  });
});