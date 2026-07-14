import { useMutation, useQueryClient } from "@tanstack/react-query";

import { votingService } from "../../api/services/voting.api";

export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: string }) =>
      votingService.cast(entityType, entityId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["voting", "results", variables.entityId] });
    },
  });
}
