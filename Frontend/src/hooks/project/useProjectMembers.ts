import { useQuery } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", "members", projectId],
    queryFn: () => projectService.getMembers(projectId as string),
    enabled: !!projectId,
  });
}
