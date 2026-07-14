import { useMutation } from "@tanstack/react-query";

import { authApi, RegisterPayload } from "../../api/services/auth.api";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
}
