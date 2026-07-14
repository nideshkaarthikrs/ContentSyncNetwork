import { useQuery } from "@tanstack/react-query";

import { votingService } from "../../api/services/voting.api";

export function useVoteResults(entityId: string | undefined) {
  return useQuery({
    queryKey: ["voting", "results", entityId],
    queryFn: () => votingService.getResults(entityId as string),
    enabled: !!entityId,
  });
}
