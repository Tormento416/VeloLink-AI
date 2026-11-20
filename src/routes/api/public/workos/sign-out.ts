import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/workos/sign-out")({
  server: { handlers: { POST: async ({ request }) => {
    const { internalRequest, workosConfigured } = await import("@/lib/workos.server");
    if (!internalRequest()) return new Response("Not found", { status: 404 });
    if (request.headers.get("origin") !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
    if (!workosConfigured()) return new Response(null, { status: 503 });
    const { getAuthkit, getAuthKitContextOrNull } = await import("@workos/authkit-tanstack-react-start");
    const auth = getAuthKitContextOrNull()?.auth();
    if (!auth?.user) return Response.json({ url: "/builder" });
    const result = await (await getAuthkit()).signOut(auth.sessionId, { returnTo: new URL("/builder", request.url).href });
    const headers = new Headers({ "Cache-Control": "no-store" });
    for (const cookie of result.response?.headers.getSetCookie() ?? []) headers.append("Set-Cookie", cookie);
    for (const [key, value] of Object.entries(result.headers ?? {})) for (const entry of Array.isArray(value) ? value : [value]) headers.append(key, entry);
    return Response.json({ url: result.logoutUrl }, { headers });
  } } },
});