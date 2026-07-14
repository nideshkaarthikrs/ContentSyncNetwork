import { useQuery } from "@tanstack/react-query";

import { lyricsService } from "../../api/services/lyrics.api";

export function useTuneLyrics(tuneId: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["lyrics", "byTune", tuneId, page, pageSize],
    queryFn: () => lyricsService.listForTune(tuneId as string, page, pageSize),
    enabled: !!tuneId,
  });
}
