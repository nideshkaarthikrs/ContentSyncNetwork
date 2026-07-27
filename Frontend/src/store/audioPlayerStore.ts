import { Audio, AVPlaybackStatus } from "expo-av";
import { create } from "zustand";

import { resolveTuneAudioUrl } from "../config/services";

type PlaybackStatus = "idle" | "loading" | "playing" | "paused";

interface AudioPlayerState {
  currentTuneId: string | null;
  sound: Audio.Sound | null;
  status: PlaybackStatus;
  play: (tuneId: string, audioUrl: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  currentTuneId: null,
  sound: null,
  status: "idle",

  play: async (tuneId, audioUrl) => {
    const { sound: existingSound } = get();
    if (existingSound) {
      try {
        await existingSound.unloadAsync();
      } catch (err) {
        console.warn("[audioPlayerStore] failed to unload previous tune audio", err);
      }
    }

    set({ currentTuneId: tuneId, sound: null, status: "loading" });

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }
      if (status.didJustFinish) {
        set({ currentTuneId: null, sound: null, status: "idle" });
      }
    };

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: resolveTuneAudioUrl(audioUrl) },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (get().currentTuneId !== tuneId) {
        // A different tune was requested while this one was still loading.
        await sound.unloadAsync();
        return;
      }

      set({ sound, status: "playing" });
    } catch (err) {
      console.warn("[audioPlayerStore] failed to load tune audio", err);
      set({ currentTuneId: null, sound: null, status: "idle" });
    }
  },

  pause: async () => {
    const { sound } = get();
    if (!sound) {
      return;
    }
    try {
      await sound.pauseAsync();
      set({ status: "paused" });
    } catch (err) {
      console.warn("[audioPlayerStore] failed to pause tune audio", err);
      set({ currentTuneId: null, sound: null, status: "idle" });
    }
  },

  resume: async () => {
    const { sound } = get();
    if (!sound) {
      return;
    }
    try {
      await sound.playAsync();
      set({ status: "playing" });
    } catch (err) {
      console.warn("[audioPlayerStore] failed to resume tune audio", err);
      set({ currentTuneId: null, sound: null, status: "idle" });
    }
  },

  stop: async () => {
    const { sound } = get();
    try {
      if (sound) {
        await sound.unloadAsync();
      }
    } catch (err) {
      console.warn("[audioPlayerStore] failed to unload tune audio", err);
    }
    set({ currentTuneId: null, sound: null, status: "idle" });
  },
}));
