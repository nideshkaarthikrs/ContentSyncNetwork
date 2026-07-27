import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { useTune } from "../../hooks/tune/useTune";
import { useAudioPlayerStore } from "../../store/audioPlayerStore";

const PRIMARY = "#7C3AED";

interface Props {
  tuneId: string;
  audioUrl?: string;
  size?: "small" | "large";
}

export default function TunePlayButton({ tuneId, audioUrl, size = "small" }: Props) {
  const { currentTuneId, status, play, pause, resume } = useAudioPlayerStore();

  // Some screens only have a tuneId (e.g. picker rows built from navigation params
  // without a full Tune fetch) — fetch the full record ourselves in that case.
  const shouldFetchTune = !audioUrl;
  const { data: fetchedTune } = useTune(shouldFetchTune ? tuneId : undefined);
  const resolvedAudioUrl = audioUrl ?? fetchedTune?.audioUrl;

  const isActive = currentTuneId === tuneId;
  const isLoading = isActive && status === "loading";
  const isPlaying = isActive && status === "playing";

  const dimension = size === "large" ? 64 : 36;
  const iconSize = size === "large" ? 28 : 18;

  const handlePress = () => {
    if (!resolvedAudioUrl) {
      return;
    }
    if (!isActive) {
      play(tuneId, resolvedAudioUrl);
      return;
    }
    if (status === "playing") {
      pause();
    } else {
      resume();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!resolvedAudioUrl || isLoading}
      style={[
        styles.button,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={iconSize}
          color="#FFF"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
});
