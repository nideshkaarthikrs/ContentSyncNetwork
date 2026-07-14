import { useQuery } from "@tanstack/react-query";

import { voiceService } from "../../api/services/voice.api";

export function useMyPerformances(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["voice", "my", page, pageSize],
    queryFn: () => voiceService.getMyPerformances(page, pageSize),
  });
}
