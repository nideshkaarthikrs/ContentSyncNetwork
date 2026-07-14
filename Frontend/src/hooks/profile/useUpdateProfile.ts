import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profileService, UpdateProfilePayload } from "../../api/services/profile.api";

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(userId as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "detail", userId] });
    },
  });
}
