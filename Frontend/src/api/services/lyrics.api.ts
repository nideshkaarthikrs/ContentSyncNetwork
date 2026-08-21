import { lyricsApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export interface Lyrics {
  lyricsId: string;
  tuneId: string;
  authorId: string;
  title: string;
  language: string;
  lyrics: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLyricsPayload {
  tuneId: string;
  title: string;
  language: string;
  lyrics: string;
}

export interface GenerateLyricsPayload {
  tuneId: string;
  language: string;
  theme: string;
}

export const lyricsService = {
  listForTune: (tuneId: string, page = 1, pageSize = 20) =>
    lyricsApi
      .get<CsnEnvelope<{ lyrics: Lyrics[]; page: number; pageSize: number; totalRecords: number }>>(
        `/tunes/${tuneId}/lyrics`,
        { params: { page, pageSize } },
      )
      .then((res) => unwrap(res.data)),

  generate: (payload: GenerateLyricsPayload) =>
    lyricsApi
      .post<CsnEnvelope<{ versions: { version: string; lyrics: string }[] }>>("/ai/lyrics/generate", payload)
      .then((res) => unwrap(res.data)),

  submit: (payload: CreateLyricsPayload) =>
    lyricsApi
      .post<CsnEnvelope<{ lyricsId: string; status: string }>>("/lyrics", payload)
      .then((res) => unwrap(res.data)),

  update: (lyricsId: string, payload: Partial<CreateLyricsPayload>) =>
    lyricsApi
      .put<CsnEnvelope<Lyrics>>(`/lyrics/${lyricsId}`, payload)
      .then((res) => unwrap(res.data)),

  getById: (lyricsId: string) =>
    lyricsApi.get<CsnEnvelope<Lyrics>>(`/lyrics/${lyricsId}`).then((res) => unwrap(res.data)),

  approve: (lyricsId: string) =>
    lyricsApi
      .post<{ status: string; message: string }>(`/lyrics/${lyricsId}/approve`)
      .then((res) => res.data),
};
