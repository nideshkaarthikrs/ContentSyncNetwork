import { chatApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export interface ChatMessage {
  messageId: string;
  message: string;
  senderUserId: string;
  senderName: string;
  sentAt: string;
}

export const chatService = {
  send: (projectId: string, message: string) =>
    chatApi
      .post<CsnEnvelope<ChatMessage>>(`/projects/${projectId}/messages`, { message })
      .then((res) => unwrap(res.data)),

  getHistory: (projectId: string, page = 1, pageSize = 50) =>
    chatApi
      .get<CsnEnvelope<{ projectId: string; messages: ChatMessage[]; page: number; pageSize: number; totalRecords: number }>>(
        `/projects/${projectId}/messages`,
        { params: { page, pageSize } },
      )
      .then((res) => unwrap(res.data)),
};
