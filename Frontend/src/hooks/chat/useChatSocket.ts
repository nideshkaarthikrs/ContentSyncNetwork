import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

import { serviceBaseUrl } from "../../config/services";
import { refreshOnce } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { ChatMessage } from "../../api/services/chat.api";

interface MessagesPage {
  projectId: string;
  messages: ChatMessage[];
  page: number;
  pageSize: number;
  totalRecords: number;
}

export function useChatSocket(projectId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) return;

    const socket: Socket = io(serviceBaseUrl("chat"), {
      auth: { token: useAuthStore.getState().token },
      transports: ["websocket"],
    });

    const queryKey = ["chat", "messages", projectId];

    socket.on("connect", () => {
      socket.emit("joinProject", { projectId });
      queryClient.invalidateQueries({ queryKey });
    });

    socket.on("connect_error", async () => {
      try {
        const token = await refreshOnce();
        socket.auth = { token };
        socket.connect();
      } catch {
        // No valid session to refresh — leave the socket disconnected.
      }
    });

    socket.on("newMessage", (message: ChatMessage) => {
      queryClient.setQueryData<MessagesPage | undefined>(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m.messageId === message.messageId)) return old;
        return { ...old, messages: [...old.messages, message] };
      });
    });

    const unsubscribeToken = useAuthStore.subscribe((state, prevState) => {
      if (state.token !== prevState.token) {
        socket.auth = { token: state.token };
        socket.disconnect();
        socket.connect();
      }
    });

    return () => {
      unsubscribeToken();
      socket.disconnect();
    };
  }, [projectId, queryClient]);
}
