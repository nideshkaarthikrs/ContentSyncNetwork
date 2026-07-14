import { useQuery } from "@tanstack/react-query";

import { tuneService } from "../../api/services/tune.api";

export function useTune(tuneId: string | undefined) {
  return useQuery({
    queryKey: ["tune", "detail", tuneId],
    queryFn: () => tuneService.getTune(tuneId as string),
    enabled: !!tuneId,
  });
}
