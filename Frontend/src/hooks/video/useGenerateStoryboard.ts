import { useMutation } from "@tanstack/react-query";

import { videoService } from "../../api/services/video.api";

export function useGenerateStoryboard() {
  return useMutation({
    mutationFn: (songId: string) => videoService.generateStoryboard(songId),
  });
}
