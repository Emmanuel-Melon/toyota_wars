import { AxiosRequestConfig } from "axios";
import { getApiConfig } from "../api/api.config";

/**
 * Strips formatting parameters (Secure, HttpOnly, Path) out of incoming Set-Cookie headers
 * to safely package them for subsequent outbound Cookie header blocks.
 */
export function parseSetCookiesToCookieHeader(setCookies: string[]): string {
  return setCookies
    .map((cookieStr) => cookieStr.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

export function splitPair(pair: string): [string, string] {
  const i = pair.indexOf("=");
  if (i === -1) return [pair.trim(), ""];
  return [pair.slice(0, i).trim(), pair.slice(i + 1)];
}

export function createBaseConfig(overrides: Partial<AxiosRequestConfig>) {
  const { baseURL, timeout } = getApiConfig();
  return {
    baseURL,
    timeout,
    withCredentials: true,
    ...overrides, // or ...overrides
  };
}

export function parseCookieHeader(header: string): Record<string, string> {
  if (!header) return {};
  return header.split("; ").reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = splitPair(pair);
    if (k) acc[k] = v;
    return acc;
  }, {});
}

export function mergeCookieHeader(
  existingCookieHeader: string | undefined,
  setCookies: string[],
): string {
  const existing = parseCookieHeader(existingCookieHeader ?? "");
  const incoming = parseSetCookiesToCookieHeader(setCookies)
    .split("; ")
    .reduce<Record<string, string>>((acc, pair) => {
      const [k, v] = splitPair(pair);
      if (k) acc[k] = v;
      return acc;
    }, {});

  return Object.entries({ ...existing, ...incoming })
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}
