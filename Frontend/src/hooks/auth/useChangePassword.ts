import { useMutation } from "@tanstack/react-query";

import { authApi, ChangePasswordPayload } from "../../api/services/auth.api";

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
  });
}
