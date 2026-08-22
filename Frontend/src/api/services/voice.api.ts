import { voiceApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";
import { appendRNFile, RNFile } from "../rnFile";

export interface Performance {
  performanceId: string;
  singerId: string;
  tuneId: string;
  lyricsId: string;
  audioUrl: string;
  pitchScore: number | null;
  clarityScore: number | null;
  rhythmScore: number | null;
  overallScore: number | null;
  createdAt: string;
}

export interface PerformanceAnalysis {
  pitch: number;
  clarity: number;
  rhythm: number;
  overall: number;
  source: "gemini" | "sample";
}

export const voiceService = {
  upload: (payload: { tuneId: string; lyricsId: string }, file: RNFile) => {
    const form = new FormData();
    form.append("tuneId", payload.tuneId);
    form.append("lyricsId", payload.lyricsId);
    appendRNFile(form, "file", file);
    return voiceApi
      .post<CsnEnvelope<{ performanceId: string }>>("/performances", form)
      .then((res) => unwrap(res.data));
  },

  getMyPerformances: (page = 1, pageSize = 10) =>
    voiceApi
      .get<CsnEnvelope<{ performances: Performance[]; page: number; pageSize: number; totalRecords: number }>>(
        "/performances/my",
        { params: { page, pageSize } },
      )
      .then((res) => unwrap(res.data)),

  getById: (performanceId: string) =>
    voiceApi
      .get<CsnEnvelope<Performance>>(`/performances/${performanceId}`)
      .then((res) => unwrap(res.data)),

  analyze: (performanceId: string) =>
    voiceApi
      .post<CsnEnvelope<PerformanceAnalysis>>(`/performances/${performanceId}/analyze`)
      .then((res) => unwrap(res.data)),
};
