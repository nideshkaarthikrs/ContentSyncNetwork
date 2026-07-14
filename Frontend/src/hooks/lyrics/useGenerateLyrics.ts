import { useMutation } from "@tanstack/react-query";

import { GenerateLyricsPayload, lyricsService } from "../../api/services/lyrics.api";

export function useGenerateLyrics() {
  return useMutation({
    mutationFn: (payload: GenerateLyricsPayload) => lyricsService.generate(payload),
  });
}
