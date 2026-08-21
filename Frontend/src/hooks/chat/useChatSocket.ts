import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

import { apiOrigin } from "../../config/services";
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

    // Connect to the gateway origin directly (not serviceBaseUrl("chat")) --
    // socket.io-client treats a URL's path as a namespace, not a route
    // prefix, so the /chat prefix has to be passed via `path` instead,
    // matching the server-side path set in message.gateway.ts.
    const socket: Socket = io(apiOrigin(), {
      path: "/chat/socket.io",
      auth: { token: useAuthStore.getState().token },
      transports: ["websocket"],
      // Reconnection is scheduled manually below (exponential backoff +
      // token refresh); the built-in reconnection would race it.
      reconnection: false,
    });

    const queryKey = ["chat", "messages", projectId];

    socket.on("connect", () => {
      reconnectAttempts = 0;
      socket.emit("joinProject", { projectId });
      queryClient.invalidateQueries({ queryKey });
    });

    // Exponential backoff on connect errors. The old handler refreshed the
    // session and reconnected immediately on every failure, which with a dead
    // backend became a tight loop that also hammered /auth/refresh-token.
    let reconnectAttempts = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    socket.on("connect_error", (err) => {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectAttempts += 1;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(async () => {
        // Only refresh when the handshake was rejected (likely an expired
        // token) — transport-level failures just retry with the same token.
        if (/jwt|token|auth/i.test(err?.message ?? "")) {
          try {
            const token = await refreshOnce();
            socket.auth = { token };
          } catch {
            // No valid session to refresh — leave the socket disconnected.
            return;
          }
        }
        socket.connect();
      }, delay);
    });

    socket.on("newMessage", (message: ChatMessage) => {
      queryClient.setQueryData<MessagesPage | undefined>(queryKey, (old) => {
        if (!old) return old;
        if (old.messages.some((m) => m.messageId === message.messageId)) return old;
        // Backend history is newest-first (desc); prepend so a live message
        // lands at index 0, consistent with that ordering.
        return { ...old, messages: [message, ...old.messages] };
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
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket.disconnect();
    };
  }, [projectId, queryClient]);
}
