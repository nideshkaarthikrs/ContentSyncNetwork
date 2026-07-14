import { useMutation } from "@tanstack/react-query";

import { authApi } from "../../api/services/auth.api";
import { useAuthStore } from "../../store/authStore";

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } finally {
        // Clear local session even if the server call fails (e.g. offline) so the user isn't stuck.
        await logout();
      }
    },
  });
}
