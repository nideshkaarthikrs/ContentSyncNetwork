import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ChatMessage, chatService } from "../../api/services/chat.api";

interface MessagesPage {
  projectId: string;
  messages: ChatMessage[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

export function useSendMessage(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ["chat", "messages", projectId];

  return useMutation({
    mutationFn: (message: string) => chatService.send(projectId as string, message),
    onSuccess: (message) => {
      queryClient.setQueryData<MessagesPage | undefined>(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m.messageId === message.messageId)) return old;
        return { ...old, messages: [...old.messages, message] };
      });
    },
  });
}
