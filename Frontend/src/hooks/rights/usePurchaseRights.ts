import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rightsService } from "../../api/services/rights.api";

export function usePurchaseRights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, licenseType }: { assetId: string; licenseType: string }) =>
      rightsService.purchase(assetId, licenseType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rights", "listings"] });
      queryClient.invalidateQueries({ queryKey: ["payment", "revenueDashboard"] });
    },
  });
}
