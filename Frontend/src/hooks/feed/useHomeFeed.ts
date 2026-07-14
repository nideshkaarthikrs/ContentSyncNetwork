import { useQuery } from "@tanstack/react-query";

import { feedService } from "../../api/services/feed.api";

export function useHomeFeed(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["feed", "home", page, pageSize],
    queryFn: () => feedService.home(page, pageSize),
  });
}
