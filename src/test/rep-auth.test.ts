import { afterEach, describe, expect, it, vi } from "vitest";
const { getContext, getRequest } = vi.hoisted(() => ({ getContext: vi.fn(), getRequest: vi.fn() }));
vi.mock("@workos/authkit-tanstack-react-start", () => ({ getAuthKitContextOrNull: getContext }));
vi.mock("@tanstack/react-start/server", () => ({ getRequest }));
import { verifiedRep } from "@/lib/rep-auth.server";

afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
function setup() {
  vi.stubEnv("WORKOS_CLIENT_ID", "client_test");
  vi.stubEnv("WORKOS_REDIRECT_URI", "https://internal.velolinkai.com/api/public/workos/callback");
  vi.stubEnv("WORKOS_COOKIE_PASSWORD", "test-cookie-password");
  vi.stubEnv("VELOLINK_REP_EMAILS", "rep@example.com");
  getRequest.mockReturnValue(new Request("https://internal.velolinkai.com/builder", { headers: { authorization: "Bearer test.test.test" } }));
}
describe("WorkOS rep authorization", () => {
  it("denies missing WorkOS session even with a legacy bearer", async () => {
    setup(); getContext.mockReturnValue(null);
    expect(await verifiedRep()).toBeNull();
  });
  it("denies public hosts even with an authorized WorkOS identity", async () => {
    setup(); getRequest.mockReturnValue(new Request("https://velolinkai.com/builder"));
    getContext.mockReturnValue({ auth: () => ({ user: { id: "user_123", email: "rep@example.com", emailVerified: true } }) });
    expect(await verifiedRep()).toBeNull();
  });
  it("denies unverified or unlisted WorkOS users", async () => {
    setup();
    getContext.mockReturnValue({ auth: () => ({ user: { id: "user_123", email: "rep@example.com", emailVerified: false } }) });
    expect(await verifiedRep()).toBeNull();
    getContext.mockReturnValue({ auth: () => ({ user: { id: "user_123", email: "other@example.com", emailVerified: true } }) });
    expect(await verifiedRep()).toBeNull();
  });
  it("returns verified WorkOS attribution and denies an unset allowlist", async () => {
    setup(); getContext.mockReturnValue({ auth: () => ({ user: { id: "user_123", email: "rep@example.com", emailVerified: true } }) });
    expect(await verifiedRep()).toEqual({ userId: "user_123", email: "rep@example.com" });
    vi.stubEnv("VELOLINK_REP_EMAILS", "");
    expect(await verifiedRep()).toBeNull();
  });
});
