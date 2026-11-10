// Server code only: reads Zendesk OAuth credentials. Never import from a client component.
import { buildTicketFromOrder, type Order } from "@velolink/core";

/** Each Zendesk call gets this long before we give up. */
const TIMEOUT_MS = 10_000;
/** Ask for one-hour tokens and refresh a minute early. Zendesk allows 300 to 172,800 seconds. */
const TOKEN_SECONDS = 3600;
const REFRESH_EARLY_MS = 60_000;

export type ZendeskConfig = {
  subdomain: string;
  clientId: string;
  clientSecret: string;
};

export class ZendeskError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ZendeskError";
  }
}

type Fetch = typeof fetch;

/**
 * Zendesk Support API client using the OAuth client credentials grant.
 * The token acts as the admin who created the OAuth client.
 */
export class ZendeskClient {
  private token: { value: string; expiresAt: number } | null = null;
  private pending: Promise<string> | null = null;

  constructor(
    private readonly config: ZendeskConfig,
    private readonly fetchImpl: Fetch = fetch,
    private readonly now: () => number = Date.now,
  ) {
    if (!/^[a-z0-9-]+$/i.test(config.subdomain)) throw new ZendeskError("Invalid Zendesk subdomain");
  }

  private get base(): string {
    return `https://${this.config.subdomain}.zendesk.com`;
  }

  /** A valid access token, fetched once and shared by concurrent callers. */
  async accessToken(): Promise<string> {
    if (this.token && this.now() < this.token.expiresAt - REFRESH_EARLY_MS) return this.token.value;
    this.pending ??= this.fetchToken().finally(() => {
      this.pending = null;
    });
    return this.pending;
  }

  private async fetchToken(): Promise<string> {
    const res = await this.fetchImpl(`${this.base}/oauth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: "read write",
        expires_in: TOKEN_SECONDS,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new ZendeskError(`Zendesk token request failed (${res.status})`, res.status);
    const body = (await res.json()) as { access_token?: string; expires_in?: number | null };
    if (!body.access_token) throw new ZendeskError("Zendesk token response had no access_token");
    const seconds = body.expires_in ?? TOKEN_SECONDS;
    this.token = { value: body.access_token, expiresAt: this.now() + seconds * 1000 };
    return this.token.value;
  }

  /** Calls the API with the bearer token, refreshing it once if Zendesk says it expired. */
  async request<T>(path: string, init: { method?: string; body?: unknown; raw?: { data: Blob; contentType: string } } = {}): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await this.accessToken();
      const res = await this.fetchImpl(`${this.base}${path}`, {
        method: init.method ?? "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": init.raw ? init.raw.contentType : "application/json",
        },
        body: init.raw ? init.raw.data : init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 401 && attempt === 0) {
        this.token = null;
        continue;
      }
      if (!res.ok) throw new ZendeskError(`Zendesk ${init.method ?? "GET"} ${path.split("?")[0]} failed (${res.status})`, res.status);
      return (await res.json()) as T;
    }
    throw new ZendeskError("Zendesk rejected a fresh token", 401);
  }

  /** Creates the customer, or updates them when the email already exists. */
  async upsertUser(user: { name: string; email: string; phone?: string }): Promise<number> {
    const res = await this.request<{ user: { id: number } }>("/api/v2/users/create_or_update", {
      method: "POST",
      body: { user: { name: user.name, email: user.email, ...(user.phone ? { phone: user.phone } : {}), role: "end-user" } },
    });
    return res.user.id;
  }

  /** Uploads a file (e.g. the Stripe invoice PDF) and returns a token to attach to a comment. */
  async upload(filename: string, data: Blob, contentType: string): Promise<string> {
    const res = await this.request<{ upload: { token: string } }>(`/api/v2/uploads?filename=${encodeURIComponent(filename)}`, {
      method: "POST",
      raw: { data, contentType },
    });
    return res.upload.token;
  }

  async findTicketByExternalId(externalId: string): Promise<number | null> {
    const res = await this.request<{ tickets: { id: number }[] }>(`/api/v2/tickets?external_id=${encodeURIComponent(externalId)}`);
    return res.tickets[0]?.id ?? null;
  }

  /**
   * Pushes an order into Zendesk: the customer as a user and a build ticket
   * assigned to the rep. Safe to retry: an existing ticket for the order is reused.
   */
  async pushOrder(order: Order, attachments: { filename: string; data: Blob; contentType: string }[] = []): Promise<{ ticketId: number; userId: number; created: boolean }> {
    const ticket = buildTicketFromOrder(order);
    const userId = await this.upsertUser({ ...order.customer });
    const existing = await this.findTicketByExternalId(ticket.externalId);
    if (existing !== null) return { ticketId: existing, userId, created: false };

    const uploads = await Promise.all(attachments.map((a) => this.upload(a.filename, a.data, a.contentType)));
    const res = await this.request<{ ticket: { id: number } }>("/api/v2/tickets", {
      method: "POST",
      body: {
        ticket: {
          subject: ticket.subject,
          comment: { html_body: ticket.htmlBody, public: false, ...(uploads.length ? { uploads } : {}) },
          requester_id: userId,
          assignee_email: ticket.assigneeEmail,
          tags: ticket.tags,
          external_id: ticket.externalId,
          priority: "normal",
        },
      },
    });
    return { ticketId: res.ticket.id, userId, created: true };
  }
}

/** The client built from Vercel env vars, or null when any is missing. */
export function zendeskFromEnv(env: NodeJS.ProcessEnv = process.env): ZendeskClient | null {
  const { ZENDESK_SUBDOMAIN, ZENDESK_CLIENT_ID, ZENDESK_CLIENT_SECRET } = env;
  if (!ZENDESK_SUBDOMAIN || !ZENDESK_CLIENT_ID || !ZENDESK_CLIENT_SECRET) return null;
  return new ZendeskClient({ subdomain: ZENDESK_SUBDOMAIN, clientId: ZENDESK_CLIENT_ID, clientSecret: ZENDESK_CLIENT_SECRET });
}
