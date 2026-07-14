import { paymentApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";

export type SubscriptionPlan = "FREE" | "PREMIUM" | "PRODUCER";

export interface RevenueDashboard {
  totalRevenue: number;
  growthPercent: number;
  revenueBreakdown: {
    subscriptions: number;
    marketplaceSales: number;
  };
  // royalties/contestWins are documented backend stubs (always 0) — no royalty-distribution
  // or contest/prize feature exists anywhere in the app to generate them from.
  royalties: number;
  marketplaceSales: number;
  contestWins: number;
}

export const paymentService = {
  subscribe: (plan: SubscriptionPlan) =>
    paymentApi
      .post<CsnEnvelope<{ subscriptionId: string; plan: string; status: string }>>("/subscriptions", { plan })
      .then((res) => unwrap(res.data)),

  getRevenueDashboard: () =>
    paymentApi.get<CsnEnvelope<RevenueDashboard>>("/revenues/dashboard").then((res) => unwrap(res.data)),

  withdraw: (amount: number, bankAccountId: string) =>
    paymentApi
      .post<CsnEnvelope<{ withdrawalId: string; status: string }>>("/revenues/withdraw", { amount, bankAccountId })
      .then((res) => unwrap(res.data)),
};
