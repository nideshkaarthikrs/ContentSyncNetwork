import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "../../api/services/notification.api";

export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
