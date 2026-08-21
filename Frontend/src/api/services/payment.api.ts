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
  // royalties is a real aggregation (sum of ROYALTY transactions) but is always 0 in
  // practice today — nothing in this codebase creates ROYALTY rows yet. contestWins is
  // a hardcoded backend stub (always 0) — no contest/prize feature exists to generate it.
  royalties: number;
  marketplaceSales: number;
  contestWins: number;
  // The caller's own subscription plan payment — an expense, not revenue. Excluded from
  // totalRevenue/availableBalance on the backend; surfaced separately so the FE can show
  // it as a spend line instead of folding it into earnings.
  subscriptionSpend: number;
  // (marketplaceSales + royalties) minus buyer debits and non-FAILED withdrawals already
  // taken — the actual amount a withdraw request can draw down.
  availableBalance: number;
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
