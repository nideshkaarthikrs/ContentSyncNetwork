import { useQuery } from "@tanstack/react-query";

import { chatService } from "../../api/services/chat.api";

export function useProjectMessages(projectId: string | undefined) {
  return useQuery({
    queryKey: ["chat", "messages", projectId],
    queryFn: () => chatService.getHistory(projectId as string),
    enabled: !!projectId,
  });
}
