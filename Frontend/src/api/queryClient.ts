import { QueryCache, QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { useToastStore } from "../store/toastStore";
import { getErrorMessage } from "./getErrorMessage";

// Auth failures are handled structurally: a dead session bounces to the Login
// group via the axios interceptor + AppNavigator, so a toast would be noise.
function isAuthError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

// Most screens have no local error UI for failed *queries*, so surface those
// through the global toast as a safety net (opt out per query with
// meta: { suppressGlobalError: true }). Mutations are excluded: every screen
// fires them via mutateAsync inside try/catch with its own Alert/setError, so
// a global mutation toast would double-report.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.suppressGlobalError || isAuthError(error)) return;
      useToastStore.getState().show(getErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});
