import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/workos/callback")({
  server: { handlers: { GET: async ({ request }) => {
    const { internalRequest, workosConfigured } = await import("@/lib/workos.server");
    if (!internalRequest()) return new Response("Not found", { status: 404 });
    if (!workosConfigured()) return new Response("Rep sign-in is not configured yet.", { status: 503 });
    const { handleCallbackRoute } = await import("@workos/authkit-tanstack-react-start");
    return handleCallbackRoute({ returnPathname: "/builder", errorRedirectUrl: "/builder" })({ request });
  } } },
});