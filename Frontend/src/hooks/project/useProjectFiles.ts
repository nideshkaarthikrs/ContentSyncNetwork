import { useQuery } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project", "files", projectId],
    queryFn: () => projectService.getFiles(projectId as string),
    enabled: !!projectId,
  });
}
