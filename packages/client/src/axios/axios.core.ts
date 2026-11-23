import { AxiosInstance, AxiosRequestConfig } from "axios";
import { getApiConfig } from "../api/api.config";
import { AxiosApiClient } from "./index";
import { parseSetCookiesToCookieHeader } from "./axios.utils";

export async function performRefresh(client: AxiosApiClient): Promise<void> {
  if (client.isRefreshing && client.refreshPromise) {
    return client.refreshPromise;
  }

  client.isRefreshing = true;
  client.refreshPromise = doRefresh(client).finally(() => {
    client.isRefreshing = false;
    client.refreshPromise = null;
  });

  return client.refreshPromise;
}

async function doRefresh(client: AxiosApiClient): Promise<void> {
  const { refreshEndpoint } = getApiConfig();
  const cookies = client.context.getSsrCookies();

  if (!refreshEndpoint) {
    throw new Error("API refresh endpoint is not configured");
  }

  try {
    await client.request<void>(refreshEndpoint, {
      method: "POST",
      headers: cookies ? { Cookie: cookies } : {},
    });

    if (typeof window === "undefined" && client.outboundCookies.length > 0) {
      const refreshed = parseSetCookiesToCookieHeader(client.outboundCookies);

      // 1. Update the in-memory provider so subsequent requests in this SSR pass use the new token
      client.setSsrCookieProvider(() => refreshed);

      // 2. Update instance default headers safely for this instance only
      client.instance.defaults.headers["Cookie"] = refreshed;

      // 3. DO NOT clear client.outboundCookies here!
      // Leaving them intact allows withIsolatedAuth to collect them and emit
      // Set-Cookie headers back to the browser's response.
    }
  } catch (error) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth:session-expired", {
          detail: { reason: "refresh_failed", error },
        }),
      );
    }
    throw error;
  }
}

export async function executeRequest<T>(
  instance: AxiosInstance,
  url: string,
  opts: AxiosRequestConfig,
): Promise<T> {
  const response = await instance.request<T>({
    url,
    method: opts.method ?? "GET",
    ...opts,
  });
  return response.status === 204 ? (undefined as T) : response.data;
}
