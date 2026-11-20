export function isAllowedRep(email: string | undefined, verified: boolean, allowlist: string | undefined): boolean {
  if (!verified || !email || !allowlist?.trim()) return false;
  const allowed = allowlist.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}