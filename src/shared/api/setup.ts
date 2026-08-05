import axios from "axios";

import { client } from "@/shared/api/client.gen";
import { authTokenRefreshCreate } from "@/shared/api/sdk.gen";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loadAccessTokenFromStorage,
  setTokens,
} from "@/shared/auth/tokens";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const { data, error } = await authTokenRefreshCreate({
      body: { refresh },
      throwOnError: false,
    });
    if (error || !data?.access) {
      clearTokens();
      return null;
    }
    const nextRefresh = "refresh" in data && typeof data.refresh === "string" ? data.refresh : refresh;
    setTokens(data.access, nextRefresh);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
}

export function setupApiClient() {
  loadAccessTokenFromStorage();

  client.setConfig({
    baseURL,
    auth: () => getAccessToken() || undefined,
  });

  client.instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (!axios.isAxiosError(error) || error.response?.status !== 401 || !original) {
        return Promise.reject(error);
      }
      if (original._retry || original.url?.includes("/auth/token")) {
        return Promise.reject(error);
      }
      original._retry = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const access = await refreshPromise;
      if (!access) {
        const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        window.location.assign(`/login?next=${next}`);
        return Promise.reject(error);
      }
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${access}`;
      return client.instance.request(original);
    },
  );
}

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
