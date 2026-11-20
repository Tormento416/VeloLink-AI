import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { isInternalHost } from "./lib/internal-host";

const internalMiddleware = createMiddleware().server(async (args) => {
  const url = new URL(args.request.url);
  const internal = isInternalHost(url.hostname, import.meta.env.DEV);
  const privatePath = url.pathname === "/builder" || url.pathname === "/start" || url.pathname.startsWith("/api/public/workos/");
  if (privatePath && !internal) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  if (internal && url.pathname === "/" && url.hostname === "internal.velolinkai.com") return new Response(null, { status: 302, headers: { Location: "/builder", "Cache-Control": "no-store" } });
  if (!internal) return args.next();
  const { workosConfigured } = await import("./lib/workos.server");
  if (!workosConfigured()) return args.next();
  const { authkitMiddleware } = await import("@workos/authkit-tanstack-react-start");
  const handler = authkitMiddleware().options.server;
  if (!handler) throw new Error("Rep sign-in unavailable");
  return handler(args);
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware, internalMiddleware],
}));
