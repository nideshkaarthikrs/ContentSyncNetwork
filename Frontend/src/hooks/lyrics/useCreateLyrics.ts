import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateLyricsPayload, lyricsService } from "../../api/services/lyrics.api";

export function useCreateLyrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLyricsPayload) => lyricsService.submit(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lyrics", "byTune", variables.tuneId] });
    },
  });
}
