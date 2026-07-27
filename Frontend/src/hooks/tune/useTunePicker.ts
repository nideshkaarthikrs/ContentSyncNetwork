import { useEffect, useState } from "react";

import { Tune } from "../../api/services/tune.api";
import { useAudioPlayerStore } from "../../store/audioPlayerStore";
import { useMyTunes } from "./useMyTunes";

/** Screens can arrive with only an id + title from navigation params; the rest
 * of the Tune (audioUrl, genre, …) may be absent until picked from the list. */
export type PickedTune = Pick<Tune, "tuneId" | "title"> & Partial<Tune>;

export function useTunePicker(initialTuneId?: string, initialTuneTitle?: string) {
  const [selectedTune, setSelectedTune] = useState<PickedTune | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: myTunes } = useMyTunes(1, 50);

  useEffect(() => {
    if (initialTuneId) {
      setSelectedTune(
        (prev) =>
          prev ?? { tuneId: initialTuneId, title: initialTuneTitle ?? initialTuneId }
      );
    }
  }, [initialTuneId, initialTuneTitle]);

  return {
    selectedTune,
    setSelectedTune,
    myTunes,
    isModalOpen,
    open: () => setModalOpen(true),
    close: () => {
      setModalOpen(false);
      // Picker rows have play buttons; a preview shouldn't outlive the modal.
      useAudioPlayerStore.getState().stop();
    },
  };
}
