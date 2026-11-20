import { getAuthKitContextOrNull } from "@workos/authkit-tanstack-react-start";
import { isAllowedRep } from "./rep-policy.server";
import { internalRequest, workosConfigured } from "./workos.server";

export async function verifiedRep() {
  if (!internalRequest() || !workosConfigured()) return null;
  const auth = getAuthKitContextOrNull()?.auth();
  if (!auth?.user || auth.impersonator) return null;
  const user = auth.user;
  if (!isAllowedRep(user.email, user.emailVerified, process.env["VELOLINK_REP_EMAILS"])) return null;
  return { userId: user.id, email: user.email ?? "" };
}