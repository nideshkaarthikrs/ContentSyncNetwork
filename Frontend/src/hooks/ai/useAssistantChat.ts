import { useMutation } from "@tanstack/react-query";

import { AssistantChatPayload, aiService } from "../../api/services/ai.api";

export function useAssistantChat() {
  return useMutation({
    mutationFn: (payload: AssistantChatPayload) => aiService.chat(payload),
  });
}
