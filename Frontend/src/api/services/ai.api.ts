import { lyricsApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export interface AssistantChatHistoryTurn {
  role: string;
  content: string;
}

export interface AssistantChatPayload {
  message: string;
  history?: AssistantChatHistoryTurn[];
}

export interface AssistantChatResponse {
  reply: string;
  source: "gemini" | "sample";
}

export const aiService = {
  // Lives in lyrics-service (`/ai/assistant/chat`), hence the lyricsApi client.
  chat: (payload: AssistantChatPayload) =>
    lyricsApi
      .post<CsnEnvelope<AssistantChatResponse>>("/ai/assistant/chat", payload)
      .then((res) => unwrap(res.data)),
};
