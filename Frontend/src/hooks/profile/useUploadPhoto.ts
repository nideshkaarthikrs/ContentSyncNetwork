import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profileService } from "../../api/services/profile.api";
import { RNFile } from "../../api/rnFile";

export function useUploadPhoto(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: RNFile) => profileService.uploadPhoto(userId as string, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "detail", userId] });
    },
  });
}
