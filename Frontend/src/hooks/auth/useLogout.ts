import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../api/services/auth.api";
import { useAuthStore } from "../../store/authStore";

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        // Clear local session even if the server call fails (e.g. offline) so the user isn't stuck.
        await logout();
        // Drop cached server state so a subsequent login can't briefly see the
        // previous account's data.
        queryClient.clear();
      }
    },
  });
}
