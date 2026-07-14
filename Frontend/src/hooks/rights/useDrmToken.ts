import { useMutation } from "@tanstack/react-query";

import { rightsService } from "../../api/services/rights.api";

export function useDrmToken() {
  return useMutation({
    mutationFn: (assetId: string) => rightsService.getDrmToken(assetId),
  });
}
