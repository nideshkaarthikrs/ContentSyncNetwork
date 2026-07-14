import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tuneService } from "../../api/services/tune.api";

export function useDeleteTune() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tuneId: string) => tuneService.deleteTune(tuneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tune", "my"] });
    },
  });
}
