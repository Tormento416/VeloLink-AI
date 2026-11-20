import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/workos/sign-in")({
  server: { handlers: { GET: async () => {
    const { internalRequest, workosConfigured } = await import("@/lib/workos.server");
    if (!internalRequest()) return new Response("Not found", { status: 404 });
    if (!workosConfigured()) return new Response("Rep sign-in is not configured yet.", { status: 503 });
    const { getAuthkit } = await import("@workos/authkit-tanstack-react-start");
    const authkit = await getAuthkit();
    const result = await authkit.createSignIn(undefined, { returnPathname: "/builder" });
    const headers = new Headers({ Location: result.url, "Cache-Control": "no-store" });
    for (const cookie of result.response?.headers.getSetCookie() ?? []) headers.append("Set-Cookie", cookie);
    for (const [key, value] of Object.entries(result.headers ?? {})) for (const entry of Array.isArray(value) ? value : [value]) headers.append(key, entry);
    return new Response(null, { status: 302, headers });
  } } },
});