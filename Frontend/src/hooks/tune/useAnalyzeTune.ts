import { useMutation } from "@tanstack/react-query";

import { tuneService } from "../../api/services/tune.api";

export function useAnalyzeTune() {
  return useMutation({
    mutationFn: (tuneId: string) => tuneService.analyzeTune(tuneId),
  });
}
