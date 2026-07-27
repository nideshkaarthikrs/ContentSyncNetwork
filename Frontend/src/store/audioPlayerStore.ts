// TODO(SDK57): migrate to expo-audio — expo-av is deprecated in SDK 54 and
// removed in SDK 55+.
import { Audio, AVPlaybackStatus } from "expo-av";
import { create } from "zustand";

import { resolveTuneAudioUrl } from "../config/services";

type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface AudioPlayerState {
  currentTuneId: string | null;
  sound: Audio.Sound | null;
  status: PlaybackStatus;
  play: (tuneId: string, audioUrl: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
}

let audioModeConfigured = false;

async function configureAudioModeOnce() {
  if (audioModeConfigured) {
    return;
  }
  audioModeConfigured = true;
  try {
    // Without this, iOS mutes playback whenever the hardware ringer switch is
    // on silent.
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  } catch (err) {
    console.warn("[audioPlayerStore] failed to configure audio mode", err);
  }
}

function unloadQuietly(sound: Audio.Sound | null) {
  sound?.unloadAsync().catch(() => {});
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

    await configureAudioModeOnce();

    let createdSound: Audio.Sound | null = null;
    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }
      if (status.didJustFinish) {
        // The native player stays loaded after a track ends; unload it or it
        // leaks. Only clear store state if a newer play() hasn't taken over.
        unloadQuietly(createdSound);
        if (get().sound === createdSound) {
          set({ currentTuneId: null, sound: null, status: "idle" });
        }
      }
    };

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: resolveTuneAudioUrl(audioUrl) },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      createdSound = sound;

      if (get().currentTuneId !== tuneId) {
        // A different tune was requested while this one was still loading.
        await sound.unloadAsync();
        return;
      }

      set({ sound, status: "playing" });
    } catch (err) {
      console.warn("[audioPlayerStore] failed to load tune audio", err);
      if (get().currentTuneId === tuneId) {
        // Keep currentTuneId so the button that started this can show the
        // error and offer a retry.
        set({ sound: null, status: "error" });
      }
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
      unloadQuietly(sound);
      if (get().sound === sound) {
        set({ currentTuneId: null, sound: null, status: "idle" });
      }
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
      unloadQuietly(sound);
      if (get().sound === sound) {
        set({ currentTuneId: null, sound: null, status: "idle" });
      }
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
