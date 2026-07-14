import { useQuery } from "@tanstack/react-query";

import { rightsService } from "../../api/services/rights.api";

export function useMyRightsListings(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["rights", "my", page, pageSize],
    queryFn: () => rightsService.getMyListings(page, pageSize),
  });
}
