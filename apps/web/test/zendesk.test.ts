import { describe, expect, it } from "vitest";
import { Order } from "@velolink/core";
import { ZendeskClient, ZendeskError, zendeskFromEnv } from "../lib/zendesk";

type Call = { url: string; init: RequestInit };

/** A fake Zendesk that answers by path. */
function fakeZendesk(routes: Record<string, (init: RequestInit) => { status: number; body: unknown }>) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const path = new URL(url).pathname;
    const handler = routes[`${init.method ?? "GET"} ${path}`];
    if (!handler) return new Response("not found", { status: 404 });
    const { status, body } = handler(init);
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

const config = { subdomain: "hyrlinkhelp", clientId: "velolink_builder", clientSecret: "s3cret" };
const token = (value = "tok-1", expires_in = 3600) => () => ({ status: 200, body: { access_token: value, expires_in, token_type: "bearer" } });

const order = Order.parse({
  id: "8f2b1c1e-1d2a-4c55-9a51-6c0f2b3a4d5e",
  rep: { name: "Jermal Smith", email: "jermal@velolink.example" },
  customer: { name: "Mike Smith", email: "mike@smithplumbing.example" },
  intake: { business: { name: "Smith Plumbing", phone: "(512) 555-0142" }, industry: "plumbing", services: ["Leak repair"] },
  package: "single_page",
  templateId: "essential",
  domain: { option: "existing", name: "smithplumbing.com" },
  payment: { status: "paid", amountCents: 99900 },
});

describe("ZendeskClient tokens", () => {
  it("uses the client credentials grant with JSON and a space-separated scope", async () => {
    const z = fakeZendesk({ "POST /oauth/tokens": token() });
    await new ZendeskClient(config, z.fetchImpl).accessToken();
    expect(z.calls[0]!.url).toBe("https://hyrlinkhelp.zendesk.com/oauth/tokens");
    expect(JSON.parse(z.calls[0]!.init.body as string)).toEqual({
      grant_type: "client_credentials",
      client_id: "velolink_builder",
      client_secret: "s3cret",
      scope: "read write",
      expires_in: 3600,
    });
  });

  it("reuses a token until shortly before it expires", async () => {
    let now = 0;
    const z = fakeZendesk({ "POST /oauth/tokens": token() });
    const client = new ZendeskClient(config, z.fetchImpl, () => now);
    await client.accessToken();
    now = 3_000_000; // 50 minutes
    await client.accessToken();
    expect(z.calls).toHaveLength(1);
    now = 3_560_000; // inside the last minute
    await client.accessToken();
    expect(z.calls).toHaveLength(2);
  });

  it("shares one token request between concurrent callers", async () => {
    const z = fakeZendesk({ "POST /oauth/tokens": token() });
    const client = new ZendeskClient(config, z.fetchImpl);
    await Promise.all([client.accessToken(), client.accessToken(), client.accessToken()]);
    expect(z.calls).toHaveLength(1);
  });

  it("refreshes the token once when the API answers 401", async () => {
    let n = 0;
    const z = fakeZendesk({
      "POST /oauth/tokens": () => ({ status: 200, body: { access_token: `tok-${++n}`, expires_in: 3600 } }),
      "GET /api/v2/tickets": (init) =>
        (init.headers as Record<string, string>).Authorization === "Bearer tok-1" ? { status: 401, body: {} } : { status: 200, body: { tickets: [] } },
    });
    expect(await new ZendeskClient(config, z.fetchImpl).findTicketByExternalId("x")).toBeNull();
    expect(n).toBe(2);
  });

  it("reports a failed token request without leaking the secret", async () => {
    const z = fakeZendesk({ "POST /oauth/tokens": () => ({ status: 400, body: { error: "invalid_scope" } }) });
    const err = await new ZendeskClient(config, z.fetchImpl).accessToken().catch((e) => e);
    expect(err).toBeInstanceOf(ZendeskError);
    expect(err.message).toBe("Zendesk token request failed (400)");
    expect(err.message).not.toContain("s3cret");
  });

  it("rejects a subdomain that could point elsewhere", () => {
    expect(() => new ZendeskClient({ ...config, subdomain: "evil.com/x" })).toThrow("Invalid Zendesk subdomain");
  });
});

describe("pushOrder", () => {
  it("creates the customer and a ticket assigned to the rep", async () => {
    const z = fakeZendesk({
      "POST /oauth/tokens": token(),
      "POST /api/v2/users/create_or_update": () => ({ status: 201, body: { user: { id: 77 } } }),
      "GET /api/v2/tickets": () => ({ status: 200, body: { tickets: [] } }),
      "POST /api/v2/uploads": () => ({ status: 201, body: { upload: { token: "up-1" } } }),
      "POST /api/v2/tickets": () => ({ status: 201, body: { ticket: { id: 501 } } }),
    });
    const res = await new ZendeskClient(config, z.fetchImpl).pushOrder(order, [{ filename: "invoice.pdf", data: new Blob(["%PDF"]), contentType: "application/pdf" }]);
    expect(res).toEqual({ ticketId: 501, userId: 77, created: true });

    const create = z.calls.find((c) => c.init.method === "POST" && c.url.endsWith("/api/v2/tickets"))!;
    const body = JSON.parse(create.init.body as string).ticket;
    expect(body.requester_id).toBe(77);
    expect(body.assignee_email).toBe("jermal@velolink.example");
    expect(body.external_id).toBe("velolink-order-8f2b1c1e-1d2a-4c55-9a51-6c0f2b3a4d5e");
    expect(body.comment.uploads).toEqual(["up-1"]);
    expect(body.comment.public).toBe(false);
    expect(create.init.headers).toMatchObject({ Authorization: "Bearer tok-1" });

    const upload = z.calls.find((c) => c.url.includes("/api/v2/uploads"))!;
    expect(upload.url).toBe("https://hyrlinkhelp.zendesk.com/api/v2/uploads?filename=invoice.pdf");
  });

  it("does not create a second ticket when the order was already pushed", async () => {
    const z = fakeZendesk({
      "POST /oauth/tokens": token(),
      "POST /api/v2/users/create_or_update": () => ({ status: 200, body: { user: { id: 77 } } }),
      "GET /api/v2/tickets": () => ({ status: 200, body: { tickets: [{ id: 501 }] } }),
    });
    const res = await new ZendeskClient(config, z.fetchImpl).pushOrder(order);
    expect(res).toEqual({ ticketId: 501, userId: 77, created: false });
    expect(z.calls.some((c) => c.init.method === "POST" && c.url.endsWith("/api/v2/tickets"))).toBe(false);
  });
});

describe("zendeskFromEnv", () => {
  it("needs all three variables", () => {
    expect(zendeskFromEnv({ ZENDESK_CLIENT_SECRET: "x" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(zendeskFromEnv({ ZENDESK_SUBDOMAIN: "hyrlinkhelp", ZENDESK_CLIENT_ID: "id", ZENDESK_CLIENT_SECRET: "x" } as unknown as NodeJS.ProcessEnv)).toBeInstanceOf(ZendeskClient);
  });
});
