import { feedApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export type FeedItemType = "TUNE" | "VIDEO" | "PROJECT";

export interface FeedItem {
  feedItemId: string;
  type: FeedItemType;
  sourceId: string;
  actorUserId: string;
  title: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// All three endpoints read the same reverse-chronological page today — true
// trending/recommended ranking would need vote-count joins across services with
// no shared event bus at MVP.
export interface FeedPage {
  page: number;
  pageSize: number;
  totalRecords: number;
  data: FeedItem[];
}

export const feedService = {
  home: (page = 1, pageSize = 20) =>
    feedApi
      .get<CsnEnvelope<FeedPage>>("/feed/home", { params: { page, pageSize } })
      .then((res) => unwrap(res.data)),

  trending: (page = 1, pageSize = 20) =>
    feedApi
      .get<CsnEnvelope<FeedPage>>("/feed/trending", { params: { page, pageSize } })
      .then((res) => unwrap(res.data)),

  recommended: (page = 1, pageSize = 20) =>
    feedApi
      .get<CsnEnvelope<FeedPage>>("/feed/recommended", { params: { page, pageSize } })
      .then((res) => unwrap(res.data)),
};
