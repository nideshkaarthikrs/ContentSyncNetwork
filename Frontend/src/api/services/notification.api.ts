import { notificationApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export type NotificationType =
  | "FOLLOW"
  | "INVITE"
  | "VOTE_RECEIVED"
  | "MARKETPLACE_SALE"
  | "COPYRIGHT_CLAIM"
  | "SYSTEM";

export interface Notification {
  notificationId: string;
  type: NotificationType;
  title: string;
  sourceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationPage {
  page: number;
  pageSize: number;
  totalRecords: number;
  unreadCount: number;
  data: Notification[];
}

export const notificationService = {
  list: (page = 1, pageSize = 20) =>
    notificationApi
      .get<CsnEnvelope<NotificationPage>>("/notifications", { params: { page, pageSize } })
      .then((res) => unwrap(res.data)),

  markAllRead: () =>
    notificationApi.post<CsnEnvelope<undefined>>("/notifications/read-all").then((res) => unwrap(res.data)),

  markRead: (notificationId: string) =>
    notificationApi
      .patch<CsnEnvelope<undefined>>(`/notifications/${notificationId}/read`)
      .then((res) => unwrap(res.data)),
};
