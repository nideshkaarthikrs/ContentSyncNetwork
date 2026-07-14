import { useQuery } from "@tanstack/react-query";

import { rightsService } from "../../api/services/rights.api";

export function useRightsListings(type?: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["rights", "listings", type, page, pageSize],
    queryFn: () => rightsService.getListings(type, page, pageSize),
  });
}
