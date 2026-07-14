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
}

export const voiceService = {
  // Response is { performanceId } at the root — do not use unwrap().
  upload: (payload: { tuneId: string; lyricsId: string }, file: RNFile) => {
    const form = new FormData();
    form.append("tuneId", payload.tuneId);
    form.append("lyricsId", payload.lyricsId);
    appendRNFile(form, "file", file);
    return voiceApi.post<{ performanceId: string }>("/performances", form).then((res) => res.data);
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

  // Response is the raw scores object with no envelope — do not use unwrap().
  analyze: (performanceId: string) =>
    voiceApi.post<PerformanceAnalysis>(`/performances/${performanceId}/analyze`).then((res) => res.data),
};
