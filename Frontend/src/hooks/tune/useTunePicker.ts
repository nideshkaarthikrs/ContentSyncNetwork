import { useEffect, useState } from "react";

import { Tune } from "../../api/services/tune.api";
import { useMyTunes } from "./useMyTunes";

export function useTunePicker(initialTuneId?: string, initialTuneTitle?: string) {
  const [selectedTune, setSelectedTune] = useState<Tune | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: myTunes } = useMyTunes(1, 50);

  useEffect(() => {
    if (initialTuneId && !selectedTune) {
      setSelectedTune({
        tuneId: initialTuneId,
        title: initialTuneTitle ?? initialTuneId,
      } as Tune);
    }
  }, [initialTuneId]);

  return {
    selectedTune,
    setSelectedTune,
    myTunes,
    isModalOpen,
    open: () => setModalOpen(true),
    close: () => setModalOpen(false),
  };
}
