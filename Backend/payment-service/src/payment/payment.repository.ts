import { Injectable } from '@nestjs/common';
import { Prisma, SubscriptionPlan, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Mirrors the `subscriptionId` display format documented in payment-service/CLAUDE.md. */
export function toSubscriptionDisplayId(sequenceNumber: number): string {
  return 'SUB' + (10000 + sequenceNumber);
}

/** Transaction types that credit the user (money in). */
const CREDIT_TYPES = [TransactionType.MARKETPLACE_SALE, TransactionType.ROYALTY];

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Available balance = credits (MARKETPLACE_SALE + ROYALTY) minus marketplace
   * spend (MARKETPLACE_PURCHASE) minus every withdrawal that hasn't FAILED.
   *
   * SUBSCRIPTION rows are deliberately excluded: they record the user's own
   * out-of-band plan payment (card/gateway money that never entered this
   * ledger), so they neither credit nor debit the internal balance.
   *
   * Callers that use the result to authorize money movement MUST run this
   * inside a transaction that already holds the per-user advisory lock, or two
   * concurrent requests can both read the same balance and overdraw.
   */
  private async computeAvailableBalance(tx: Prisma.TransactionClient, userId: string): Promise<number> {
    // Sequential, not Promise.all: these run on an interactive transaction's
    // single connection, and the surrounding advisory lock already makes the
    // few extra round-trips irrelevant.
    const credits = await tx.transaction.aggregate({
      where: { userId, type: { in: CREDIT_TYPES } },
      _sum: { amount: true },
    });
    const purchases = await tx.transaction.aggregate({
      where: { userId, type: TransactionType.MARKETPLACE_PURCHASE },
      _sum: { amount: true },
    });
    const withdrawn = await tx.withdrawalRequest.aggregate({
      where: { userId, status: { not: 'FAILED' } },
      _sum: { amount: true },
    });
    return (credits._sum.amount ?? 0) - (purchases._sum.amount ?? 0) - (withdrawn._sum.amount ?? 0);
  }

  /** Read-only balance for display (dashboard). Not safe to authorize spend with. */
  getAvailableBalance(userId: string): Promise<number> {
    return this.computeAvailableBalance(this.prisma, userId);
  }

  /**
   * Creates a subscription only if the user has no ACTIVE subscription already.
   * The existence check and the insert run in one transaction under the same
   * per-user advisory lock the balance-changing paths use, so two concurrent
   * POST /subscriptions can't both pass the check and leave the user with two
   * ACTIVE plans (and two charges). Returns null when one already exists.
   *
   * The SUBSCRIPTION Transaction row is written inside the same transaction so
   * a subscription can never exist without its matching ledger row.
   */
  createSubscriptionIfNoneActive(userId: string, userDisplayId: string, plan: SubscriptionPlan, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      const existing = await tx.subscription.findFirst({ where: { userId, status: 'ACTIVE' } });
      if (existing) {
        return null;
      }
      const sub = await tx.subscription.create({
        data: { userId, userDisplayId, plan, amount },
      });
      // A subscription payment is the paying user's own expense, not revenue for
      // them. It is recorded for history/receipts only — the revenue dashboard
      // reports it as `subscriptionSpend`, never as revenue, and
      // computeAvailableBalance ignores it entirely.
      await tx.transaction.create({
        data: {
          userId,
          userDisplayId,
          type: TransactionType.SUBSCRIPTION,
          amount,
          sourceId: toSubscriptionDisplayId(sub.sequenceNumber),
        },
      });
      return sub;
    });
  }

  createWebhookEvent(eventType: string, payload: Record<string, any>) {
    return this.prisma.webhookEvent.create({
      data: { eventType, payload },
    });
  }

  /**
   * Creates a withdrawal only if the user's available balance covers it. The
   * balance check and the insert run in one transaction under a per-user
   * advisory lock so two concurrent requests can't both pass the check and
   * overdraw. Returns null when the balance is insufficient.
   */
  createWithdrawalIfBalanceAllows(userId: string, userDisplayId: string, amount: number, bankAccountId: string) {
    return this.prisma.$transaction(async (tx) => {
      // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which
      // $queryRaw cannot deserialize.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      const available = await this.computeAvailableBalance(tx, userId);
      if (amount > available) {
        return null;
      }
      return tx.withdrawalRequest.create({
        data: { userId, userDisplayId, amount, bankAccountId },
      });
    });
  }

  /**
   * Moves `amount` from buyer to seller as two ledger rows written in one
   * transaction: a MARKETPLACE_PURCHASE debit on the buyer and a
   * MARKETPLACE_SALE credit on the seller. Never one without the other.
   *
   * The buyer's balance check and both inserts run under the buyer's advisory
   * lock, exactly like createWithdrawalIfBalanceAllows, so two concurrent
   * purchases by the same buyer are serialized and the second one sees the
   * first one's debit. Returns null when the buyer can't cover the amount.
   *
   * Only the buyer is locked. The seller side is an unconditional insert with
   * no balance check, so it needs no lock — and because every transaction here
   * takes at most one advisory lock, two transfers in opposite directions
   * (A buys from B while B buys from A) cannot deadlock on lock ordering.
   */
  createTransferIfBalanceAllows(params: {
    buyerId: string;
    buyerUserId: string;
    sellerId: string;
    sellerUserId: string;
    amount: number;
    sourceId?: string;
    reference?: string;
  }) {
    const { buyerId, buyerUserId, sellerId, sellerUserId, amount, sourceId, reference } = params;
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${buyerId}))`;
      const available = await this.computeAvailableBalance(tx, buyerId);
      if (amount > available) {
        return null;
      }
      const debit = await tx.transaction.create({
        data: {
          userId: buyerId,
          userDisplayId: buyerUserId,
          type: TransactionType.MARKETPLACE_PURCHASE,
          amount,
          sourceId,
          reference,
        },
      });
      const credit = await tx.transaction.create({
        data: {
          userId: sellerId,
          userDisplayId: sellerUserId,
          type: TransactionType.MARKETPLACE_SALE,
          amount,
          sourceId,
          reference,
        },
      });
      return { debit, credit };
    });
  }

  createTransaction(
    userId: string,
    userDisplayId: string,
    type: TransactionType,
    amount: number,
    sourceId?: string,
    reference?: string,
  ) {
    return this.prisma.transaction.create({
      data: { userId, userDisplayId, type, amount, sourceId, reference },
    });
  }

  sumByType(userId: string) {
    return this.prisma.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { amount: true },
    });
  }

  /**
   * Sums only the credit types in a date range. Scoped to CREDIT_TYPES on
   * purpose: this feeds the dashboard's revenue growth, and MARKETPLACE_PURCHASE
   * (a debit) / SUBSCRIPTION (own spend) rows would otherwise be counted as
   * revenue growth.
   */
  async sumInRange(userId: string, start: Date, end: Date) {
    const result = await this.prisma.transaction.aggregate({
      where: { userId, type: { in: CREDIT_TYPES }, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

}
