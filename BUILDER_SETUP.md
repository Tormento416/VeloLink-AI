# VeloLinkAI sales configurator

## Rep access

1. Create/invite each rep account in **More → Users → Add user**. Public self-signup and anonymous signup are disabled. Email/password sign-in is enabled; invited reps must complete email confirmation before access is granted. No extra profile table is used.
2. In **Project Settings → Secrets**, add `VELOLINK_REP_EMAILS` containing the comma-separated login emails of authorized reps. Never prefix it with `VITE_`. Matching is exact and case-insensitive; an unset/empty value denies all reps.
3. Reps sign in at `/builder`. Every rep operation validates the bearer against Auth, requires a confirmed email and the current allowlist, and records the Auth user ID/email. Signing in alone grants no rep rights. Removing an email immediately denies subsequent server requests.

## Storage and security

`builder_orders` is private with RLS enabled and no browser `anon`/`authenticated` grants. Only authorized rep server operations use the privileged client. Rep list queries always filter by the current verified caller ID and source, with no ID supplied by the client.

There is no public configurator or public quote submission server function. `/start` redirects to `/builder`, and public AI Web Builder links go directly to rep login. Public marketing add-ons are informational, not selectable order options. Signup is disabled; reps are created/invited by the owner.

Migration `0002_restrict_builder_orders_to_reps.sql` replaces the public insert rate limiter with a rep-only insert/update guard and adds a rep-only constraint. Historical public rows are retained but cannot be updated or created as public orders. The constraint is NOT VALID only to preserve those existing historical rows; PostgreSQL still enforces it for every new insert/update. The database guard rejects public writes even from a stale privileged insert handler. Current verified-email allowlist authorization remains enforced by every server action, before loading the privileged client.

The server accepts only the strict rep schema; forged source, attribution, and price fields are rejected.

No manual database setup is required: the migration has been applied. Use the migration tool for future schema changes; do not edit generated auth clients or migration metadata.

## Quote / checkout contract

`submitRepQuote({ data: RepBuilderInput })` returns `{ id, status: "quote_requested", pricing_status: "pending_confirmation", checkout: { state: "quote_only", price_id: null, checkout_url: null }, provisioning: "after_confirmation" }` only after persistence succeeds. Pricing fields never come from request bodies. No card charge, confirmed price, website generation, email notification, or Vapi provisioning happens in this version.

There is no configured Stripe/Vapi integration. A future checkout handler must authenticate and authorize the caller/quote, load the saved configuration, select a provider-verified price ID from a server-owned catalog, validate currency and one-time/recurring scope, and return a real checkout URL. It must require current verified rep authorization for all payment actions and reject all public callers and client price IDs/totals. Confirmation must come from a verified provider webhook, never a return-page flag. Until that exists, every configuration stays pending pricing confirmation.

Vapi model, tier, and allowance are requested configuration only. No external URLs are fetched from user input; no Vapi credentials are requested or exposed. Templates/colors are quote directions, not generated sites.

## Verification

Run `bunx vitest run src/test/builder-validation.test.ts src/test/rep-auth.test.ts src/test/builder-server.test.ts`. End-to-end allowlisted rep verification requires a configured allowlist and an authorized confirmed account. The project must not be published/deployed as part of this task.
## WorkOS private workspace

Rep sign-in is handled by WorkOS only on `internal.velolinkai.com`; public hosts receive not found for the workspace and its sign-in routes. Configured in **Project Settings → Secrets**:

- `WORKOS_CLIENT_ID` — saved.
- `WORKOS_REDIRECT_URI` — saved as `https://internal.velolinkai.com/api/public/workos/callback`. The same callback must be registered in the WorkOS dashboard (Authentication → Redirects), or sign-in fails at the WorkOS side.
- `WORKOS_COOKIE_PASSWORD` — generated and stored.
- `VELOLINK_REP_EMAILS` — saved; comma-separated approved rep emails. Each WorkOS account must have a verified email. Removing an email denies that rep's next request.

`internal.velolinkai.com` is connected and DNS-verified. Because `velolinkai.com` is the primary domain, connected domains redirect to it — open **Project Settings → Domains → velolinkai.com → ⋯ → Unset as primary** so the internal address serves the workspace instead of redirecting to the public site.

The WorkOS session package is patched (`patches/`) to replace a JSON import attribute the server runtime cannot resolve; the patch reapplies automatically on install.

## Contact and booking intake

Public contact inquiries are stored privately in `contact_inquiries`; meeting requests are stored privately in `booking_requests` as `awaiting_confirmation`. Visitors cannot read either table. Public routing displays `sales@velolinkai.com`; inquiry notifications are intended for `hyrlink.admin@hyrlink.app`, and booking review for `asousa@hyrlink.app`.

Email notifications are not active yet because no verified app-email sender domain is configured. Missing setup: configure and verify the app's email domain in **More → Emails**, then ask for the notification sends to be wired. Google Calendar automation is not configured, so booking requests remain stored for review/rep assignment and no calendar event is claimed.
