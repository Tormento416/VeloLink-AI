export const internalOrigin = "https://internal.velolinkai.com";

export function isInternalHost(hostname: string, development = false): boolean {
  return hostname === "internal.velolinkai.com" || (development && ["localhost", "127.0.0.1"].includes(hostname));
}