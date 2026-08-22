import { videoApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";
import { appendRNFile, RNFile } from "../rnFile";

export interface CreateVideoProjectPayload {
  songId: string;
  title: string;
}

export interface VideoProject {
  videoProjectId: string;
  status: string;
}

export interface Video {
  videoId: string;
  status: string;
}

export interface Storyboard {
  songId: string;
  shots: { shot: number; description: string; duration: number }[];
  source: "gemini" | "sample";
}

export const videoService = {
  createProject: (payload: CreateVideoProjectPayload) =>
    videoApi
      .post<CsnEnvelope<VideoProject>>("/video-projects", payload)
      .then((res) => unwrap(res.data)),

  // video-service's upload endpoint has no field linking it to a video project (backend limitation).
  // `kind: "MOOD_BOARD"` tells video-service this upload is a mood-board image, not an
  // actual video, so it skips creating a "New video uploaded" feed post for it.
  uploadVideo: (file: RNFile, kind?: "MOOD_BOARD") => {
    const form = new FormData();
    appendRNFile(form, "file", file);
    if (kind) {
      form.append("kind", kind);
    }
    return videoApi.post<CsnEnvelope<Video>>("/videos", form).then((res) => unwrap(res.data));
  },

  getVideo: (videoId: string) =>
    videoApi.get<CsnEnvelope<unknown>>(`/videos/${videoId}`).then((res) => unwrap(res.data)),

  generateStoryboard: (songId: string) =>
    videoApi
      .post<CsnEnvelope<Storyboard>>("/ai/storyboards", { songId })
      .then((res) => unwrap(res.data)),
};
