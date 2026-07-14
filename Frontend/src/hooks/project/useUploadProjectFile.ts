import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../../api/services/project.api";
import { RNFile } from "../../api/rnFile";

export function useUploadProjectFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: RNFile) => projectService.uploadFile(projectId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", "files", projectId] });
    },
  });
}
