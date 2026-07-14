import { useQuery } from "@tanstack/react-query";

import { notificationService } from "../../api/services/notification.api";

export function useNotifications(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["notifications", "list", page, pageSize],
    queryFn: () => notificationService.list(page, pageSize),
  });
}
