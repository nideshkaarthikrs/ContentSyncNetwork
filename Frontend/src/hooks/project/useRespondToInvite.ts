import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useRespondToInvite(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: "ACCEPTED" | "DECLINED") =>
      projectService.respondToInvite(projectId as string, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "members", projectId] });
    },
  });
}
