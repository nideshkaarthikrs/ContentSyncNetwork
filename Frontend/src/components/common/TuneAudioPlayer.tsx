import Video from "react-native-video";

import { useAudioPlayerStore } from "../../store/audioPlayerStore";

/**
 * Owns the single native audio player instance for tune playback. Mounted once at the
 * app root — playback is controlled imperatively from anywhere via useAudioPlayerStore
 * (see TunePlayButton), not by mounting/unmounting this component per screen.
 */
export default function TuneAudioPlayer() {
  const currentTuneId = useAudioPlayerStore((s) => s.currentTuneId);
  const audioUrl = useAudioPlayerStore((s) => s.audioUrl);
  const status = useAudioPlayerStore((s) => s.status);

  if (!currentTuneId || !audioUrl) {
    return null;
  }

  return (
    <Video
      source={{ uri: audioUrl }}
      paused={status !== "playing" && status !== "loading"}
      // iOS mutes playback whenever the hardware ringer switch is on silent unless overridden.
      ignoreSilentSwitch="ignore"
      playInBackground={false}
      onLoad={() => useAudioPlayerStore.getState()._onLoaded(currentTuneId)}
      onEnd={() => useAudioPlayerStore.getState()._onFinished(currentTuneId)}
      onError={() => useAudioPlayerStore.getState()._onFailed(currentTuneId, audioUrl)}
      style={styles.hidden}
    />
  );
}

const styles = {
  hidden: { width: 0, height: 0 },
} as const;
