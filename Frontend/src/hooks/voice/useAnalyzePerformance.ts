import { useMutation } from "@tanstack/react-query";

import { voiceService } from "../../api/services/voice.api";

export function useAnalyzePerformance() {
  return useMutation({
    mutationFn: (performanceId: string) => voiceService.analyze(performanceId),
  });
}
