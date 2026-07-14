import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useInviteCollaborator(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectService.invite(projectId as string, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "members", projectId] });
    },
  });
}
