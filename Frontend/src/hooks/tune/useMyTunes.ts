import { useQuery } from "@tanstack/react-query";

import { tuneService } from "../../api/services/tune.api";

export function useMyTunes(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["tune", "my", page, limit],
    queryFn: () => tuneService.getMyTunes(page, limit),
  });
}
