import { useMutation } from "@tanstack/react-query";

import { authApi, LoginPayload } from "../../api/services/auth.api";
import { useAuthStore } from "../../store/authStore";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      await setSession({
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
  });
}
