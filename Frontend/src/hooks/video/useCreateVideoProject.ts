import { useMutation } from "@tanstack/react-query";

import { CreateVideoProjectPayload, videoService } from "../../api/services/video.api";

export function useCreateVideoProject() {
  return useMutation({
    mutationFn: (payload: CreateVideoProjectPayload) => videoService.createProject(payload),
  });
}
