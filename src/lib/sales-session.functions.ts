import { createServerFn } from "@tanstack/react-start";

export const getSalesSession = createServerFn({ method: "POST" }).handler(async () => {
  const { internalRequest, workosConfigured } = await import("./workos.server");
  const internal = internalRequest();
  if (!internal) return { user: null, configured: false, internal: false };
  const configured = workosConfigured();
  if (!configured) return { user: null, configured: false, internal: true };
  const { getAuthKitContextOrNull } = await import("@workos/authkit-tanstack-react-start");
  const auth = getAuthKitContextOrNull()?.auth();
  return { user: auth?.user ? { id: auth.user.id, email: auth.user.email } : null, configured, internal };
});