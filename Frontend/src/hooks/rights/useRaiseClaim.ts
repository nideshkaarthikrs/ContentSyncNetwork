import { useMutation } from "@tanstack/react-query";

import { rightsService } from "../../api/services/rights.api";

export function useRaiseClaim() {
  return useMutation({
    mutationFn: ({ assetId, reason }: { assetId: string; reason: string }) =>
      rightsService.raiseClaim(assetId, reason),
  });
}
