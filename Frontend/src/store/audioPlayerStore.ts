import { create } from "zustand";

import { resolveTuneAudioUrl } from "../config/services";

type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error" | "unavailable";

interface AudioPlayerState {
  currentTuneId: string | null;
  // The resolved URL for the tune currently loaded into the mounted <TuneAudioPlayer/>.
  audioUrl: string | null;
  status: PlaybackStatus;
  play: (tuneId: string, audioUrl: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  // Called by the single mounted <TuneAudioPlayer/> in response to native playback events —
  // not part of the public API consumed by screens/components.
  _onLoaded: (tuneId: string) => void;
  _onFinished: (tuneId: string) => void;
  _onFailed: (tuneId: string, resolvedUrl: string) => void;
}

// A playback failure could be a transient network issue (retryable) or the
// file genuinely no longer existing server-side (retrying is pointless).
// react-native-video doesn't surface the underlying HTTP status, so probe it
// directly; inconclusive results (timeout, non-404 error) are treated as retryable.
// Exported (not just used internally) so it's unit-testable without needing to
// trigger real playback.
export async function classifyPlaybackFailure(url: string): Promise<"error" | "unavailable"> {
  // AbortSignal.timeout() isn't available in the RN JS runtime -- build the same
  // behavior manually with AbortController + setTimeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { method: "HEAD", signal: controller.signal });
    return response.status === 404 ? "unavailable" : "error";
  } catch {
    return "error";
  } finally {
    clearTimeout(timer);
  }
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentTuneId: null,
  audioUrl: null,
  status: "idle",

  play: (tuneId, audioUrl) => {
    set({ currentTuneId: tuneId, audioUrl: resolveTuneAudioUrl(audioUrl), status: "loading" });
  },

  pause: () => {
    if (!get().currentTuneId) {
      return;
    }
    set({ status: "paused" });
  },

  resume: () => {
    if (!get().currentTuneId) {
      return;
    }
    set({ status: "playing" });
  },

  stop: () => {
    set({ currentTuneId: null, audioUrl: null, status: "idle" });
  },

  _onLoaded: (tuneId) => {
    // A different tune may have been requested while this one was still loading.
    if (get().currentTuneId === tuneId) {
      set({ status: "playing" });
    }
  },

  _onFinished: (tuneId) => {
    if (get().currentTuneId === tuneId) {
      set({ currentTuneId: null, audioUrl: null, status: "idle" });
    }
  },

  _onFailed: (tuneId, resolvedUrl) => {
    if (get().currentTuneId !== tuneId) {
      return;
    }
    // Distinguish "file is permanently gone" (404 -> non-retryable) from any
    // other failure (network blip, etc. -> retryable "error"), so the button
    // doesn't loop retrying a request that can never succeed. currentTuneId is
    // deliberately kept (not cleared) so the button stays addressed at this
    // tune and can show the error/unavailable state.
    classifyPlaybackFailure(resolvedUrl).then((finalStatus) => {
      if (get().currentTuneId === tuneId) {
        set({ audioUrl: null, status: finalStatus });
      }
    });
  },
}));
