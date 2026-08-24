import Feather from "react-native-vector-icons/Feather";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { useTune } from "../../hooks/tune/useTune";
import { useAudioPlayerStore } from "../../store/audioPlayerStore";
import { useTheme } from "../../theme/useTheme";
import { Theme } from "../../theme/theme";

interface Props {
  tuneId: string;
  audioUrl?: string;
  size?: "small" | "large";
}

export default function TunePlayButton({ tuneId, audioUrl, size = "small" }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);

  // Field-level selectors: this button renders inside FlatList rows (up to 50
  // in the tune picker), so a whole-store subscription would re-render every
  // row on each playback tick.
  const isActive = useAudioPlayerStore((s) => s.currentTuneId === tuneId);
  const status = useAudioPlayerStore((s) =>
    s.currentTuneId === tuneId ? s.status : "idle"
  );

  // Some screens only have a tuneId (e.g. picker rows built from navigation params
  // without a full Tune fetch) — fetch the full record ourselves in that case.
  const shouldFetchTune = !audioUrl;
  const { data: fetchedTune, isLoading: isFetchingTune } = useTune(
    shouldFetchTune ? tuneId : undefined
  );
  const resolvedAudioUrl = audioUrl ?? fetchedTune?.audioUrl;

  const isResolving = shouldFetchTune && isFetchingTune;
  const isLoading = (isActive && status === "loading") || isResolving;
  const isPlaying = isActive && status === "playing";
  const hasError = isActive && status === "error";
  const isUnavailable = isActive && status === "unavailable";

  const dimension = size === "large" ? 64 : 36;
  const iconSize = size === "large" ? 28 : 18;

  const handlePress = () => {
    if (!resolvedAudioUrl || isUnavailable) {
      return;
    }
    const player = useAudioPlayerStore.getState();
    if (!isActive || status === "error") {
      player.play(tuneId, resolvedAudioUrl);
      return;
    }
    if (status === "playing") {
      player.pause();
    } else {
      player.resume();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!resolvedAudioUrl || isLoading || isUnavailable}
      style={[
        styles.button,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Feather
          name={isUnavailable ? "slash" : hasError ? "alert-circle" : isPlaying ? "pause" : "play"}
          size={iconSize}
          color="#FFF"
        />
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });
