import { votingApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export const votingService = {
  cast: (entityType: string, entityId: string) =>
    votingApi
      .post<CsnEnvelope<{ voteId: string; entityType: string; entityId: string }>>("/votes", {
        entityType,
        entityId,
      })
      .then((res) => unwrap(res.data)),

  getResults: (entityId: string) =>
    votingApi
      .get<CsnEnvelope<{ entityId: string; votes: number; rank: number }>>(`/votes/results/${entityId}`)
      .then((res) => unwrap(res.data)),
};
