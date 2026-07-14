import { useMutation, useQueryClient } from "@tanstack/react-query";

import { voiceService } from "../../api/services/voice.api";
import { RNFile } from "../../api/rnFile";

export function useUploadPerformance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, file }: { payload: { tuneId: string; lyricsId: string }; file: RNFile }) =>
      voiceService.upload(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice", "my"] });
    },
  });
}
