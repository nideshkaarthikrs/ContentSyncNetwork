import { useMutation, useQueryClient } from "@tanstack/react-query";

import { lyricsService } from "../../api/services/lyrics.api";

export function useApproveLyrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lyricsId: string) => lyricsService.approve(lyricsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lyrics"] });
    },
  });
}
