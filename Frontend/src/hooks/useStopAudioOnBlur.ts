import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

import { useAudioPlayerStore } from "../store/audioPlayerStore";

/**
 * Stops tune playback when the hosting screen loses focus. Call this from any
 * screen that renders a TunePlayButton — the store is global, so without this
 * audio keeps playing after navigating away. Deliberately screen-level, not
 * TunePlayButton-level: the button renders inside FlatList rows, and list
 * virtualization unmounting an offscreen row must not kill playback.
 */
export function useStopAudioOnBlur() {
  const navigation = useNavigation();
  useEffect(() => {
    return navigation.addListener("blur", () => {
      useAudioPlayerStore.getState().stop();
    });
  }, [navigation]);
}
