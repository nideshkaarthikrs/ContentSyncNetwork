import { useMutation } from "@tanstack/react-query";

import { videoService } from "../../api/services/video.api";
import { RNFile } from "../../api/rnFile";

export function useUploadVideo() {
  return useMutation({
    mutationFn: ({ file, kind }: { file: RNFile; kind?: "MOOD_BOARD" }) =>
      videoService.uploadVideo(file, kind),
  });
}
