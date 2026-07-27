import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { ServiceName, serviceBaseUrl } from "../config/services";
import { useAuthStore } from "../store/authStore";
import { queryClient } from "./queryClient";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Shared across all per-service clients so concurrent 401s trigger a single refresh call.
let refreshPromise: Promise<string> | null = null;

export function refreshOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = useAuthStore
      .getState()
      .refreshSession()
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function createServiceClient(service: ServiceName): AxiosInstance {
  const instance = axios.create({ baseURL: serviceBaseUrl(service) });

  instance.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      const status = error.response?.status;

      if (status !== 401 || !originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      // No token means this wasn't an authenticated request whose token expired (e.g. a login
      // attempt with wrong credentials) — refreshing can't help, and would mask the real 401 error.
      if (!useAuthStore.getState().token) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const newToken = await refreshOnce();
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return instance(originalRequest);
      } catch (refreshError) {
        // Clearing the token swaps AppNavigator to the Login group; dropping
        // the query cache keeps the dead session's data out of the next one.
        await useAuthStore.getState().logout();
        queryClient.clear();
        return Promise.reject(refreshError);
      }
    },
  );

  return instance;
}

export const identityApi = createServiceClient("identity");
export const profileApi = createServiceClient("profile");
export const tuneApi = createServiceClient("tune");
export const lyricsApi = createServiceClient("lyrics");
export const voiceApi = createServiceClient("voice");
export const videoApi = createServiceClient("video");
export const projectApi = createServiceClient("project");
export const chatApi = createServiceClient("chat");
export const votingApi = createServiceClient("voting");
export const feedApi = createServiceClient("feed");
export const rightsApi = createServiceClient("rights");
export const paymentApi = createServiceClient("payment");
export const notificationApi = createServiceClient("notification");
