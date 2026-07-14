import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateTunePayload, tuneService } from "../../api/services/tune.api";
import { RNFile } from "../../api/rnFile";

export function useCreateTune() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, audio }: { payload: CreateTunePayload; audio: RNFile }) =>
      tuneService.create(payload, audio),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tune", "my"] });
    },
  });
}
