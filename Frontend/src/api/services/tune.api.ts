import { tuneApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";
import { appendRNFile, RNFile } from "../rnFile";

export interface CreateTunePayload {
  title: string;
  genre: string;
  language: string;
  mood: string;
  bpm?: number;
}

export interface Tune {
  tuneId: string;
  ownerId: string;
  title: string;
  genre: string;
  language: string;
  mood: string;
  bpm: number | null;
  audioUrl: string;
  duration: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TuneAnalysis {
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  confidence: number;
}

export const tuneService = {
  create: (payload: CreateTunePayload, audio: RNFile) => {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("genre", payload.genre);
    form.append("language", payload.language);
    form.append("mood", payload.mood);
    if (payload.bpm !== undefined) form.append("bpm", String(payload.bpm));
    appendRNFile(form, "audio", audio);
    return tuneApi
      .post<CsnEnvelope<{ tuneId: string; status: string }>>("/tunes", form)
      .then((res) => unwrap(res.data));
  },

  getMyTunes: (page = 1, limit = 10) =>
    tuneApi
      .get<CsnEnvelope<{ tunes: Tune[]; total: number; page: number; limit: number }>>("/tunes/my", {
        params: { page, limit },
      })
      .then((res) => unwrap(res.data)),

  getTune: (tuneId: string) =>
    tuneApi.get<CsnEnvelope<Tune>>(`/tunes/${tuneId}`).then((res) => unwrap(res.data)),

  // Response is { status: 'SUCCESS', message } with no `data` key — unwrap() would return undefined, fine for a void result.
  deleteTune: (tuneId: string) =>
    tuneApi.delete<{ status: string; message: string }>(`/tunes/${tuneId}`).then((res) => res.data),

  analyzeTune: (tuneId: string) =>
    tuneApi
      .post<CsnEnvelope<TuneAnalysis>>(`/tunes/${tuneId}/analyze`)
      .then((res) => unwrap(res.data)),
};
