import { getRequest } from "@tanstack/react-start/server";
import { isInternalHost } from "./internal-host";

export function internalRequest() {
  return isInternalHost(new URL(getRequest().url).hostname, import.meta.env.DEV);
}

export function workosConfigured() {
  return Boolean(process.env["WORKOS_CLIENT_ID"] && process.env["WORKOS_REDIRECT_URI"] && process.env["WORKOS_COOKIE_PASSWORD"]);
}