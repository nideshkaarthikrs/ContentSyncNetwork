import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectName: string) => projectService.create(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "my"] });
    },
  });
}
