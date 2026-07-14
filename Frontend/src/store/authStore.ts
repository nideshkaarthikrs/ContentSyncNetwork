import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { serviceBaseUrl } from "../config/services";

const TOKEN_KEY = "csn.token";
const REFRESH_TOKEN_KEY = "csn.refreshToken";
const USER_KEY = "csn.user";

export interface AuthUser {
  userId: string;
  name: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (session: { token: string; refreshToken: string; user: AuthUser }) => Promise<void>;
  logout: () => Promise<void>;
  /** Refreshes the access token via a bare axios call (not the intercepted client, to avoid a circular import into api/client.ts). */
  refreshSession: () => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      // A hung (not just throwing) SecureStore read shouldn't strand the app on the splash
      // screen forever — race it against a timeout that falls back to a logged-out state.
      const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 4000));
      const read = Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      const result = await Promise.race([read, timeout]);
      if (result === "timeout") {
        set({ token: null, refreshToken: null, user: null, isHydrated: true });
        return;
      }
      const [token, refreshToken, userRaw] = result;
      set({
        token,
        refreshToken,
        user: userRaw ? (JSON.parse(userRaw) as AuthUser) : null,
        isHydrated: true,
      });
    } catch {
      // A corrupted stored value or an unavailable keychain shouldn't strand the app on the
      // splash screen forever — fall back to a logged-out state.
      set({ token: null, refreshToken: null, user: null, isHydrated: true });
    }
  },

  setSession: async ({ token, refreshToken, user }) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ token, refreshToken, user });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    set({ token: null, refreshToken: null, user: null });
  },

  refreshSession: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${serviceBaseUrl("identity")}/auth/refresh-token`, {
      refreshToken,
    });
    const { token: newToken, refreshToken: newRefreshToken } = response.data as {
      token: string;
      refreshToken: string;
    };

    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    set({ token: newToken, refreshToken: newRefreshToken });

    return newToken;
  },
}));
