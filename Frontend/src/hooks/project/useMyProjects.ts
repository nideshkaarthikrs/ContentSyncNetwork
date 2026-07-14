import { useQuery } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useMyProjects(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["project", "my", page, limit],
    queryFn: () => projectService.getMyProjects(page, limit),
  });
}
