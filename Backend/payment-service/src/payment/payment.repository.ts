import { Injectable } from '@nestjs/common';
import { SubscriptionPlan, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSubscription(userId: string, userDisplayId: string, plan: SubscriptionPlan, amount: number) {
    return this.prisma.subscription.create({
      data: { userId, userDisplayId, plan, amount },
    });
  }

  createWebhookEvent(eventType: string, payload: Record<string, any>) {
    return this.prisma.webhookEvent.create({
      data: { eventType, payload },
    });
  }

  /**
   * Creates a withdrawal only if the user's available balance (earnings minus
   * prior non-FAILED withdrawals) covers it. The balance check and the insert
   * run in one transaction under a per-user advisory lock so two concurrent
   * requests can't both pass the check and overdraw. Returns null when the
   * balance is insufficient.
   */
  createWithdrawalIfBalanceAllows(userId: string, userDisplayId: string, amount: number, bankAccountId: string) {
    return this.prisma.$transaction(async (tx) => {
      // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which
      // $queryRaw cannot deserialize.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
      const earnings = await tx.transaction.aggregate({
        where: { userId, type: { in: [TransactionType.MARKETPLACE_SALE, TransactionType.ROYALTY] } },
        _sum: { amount: true },
      });
      const withdrawn = await tx.withdrawalRequest.aggregate({
        where: { userId, status: { not: 'FAILED' } },
        _sum: { amount: true },
      });
      const available = (earnings._sum.amount ?? 0) - (withdrawn._sum.amount ?? 0);
      if (amount > available) {
        return null;
      }
      return tx.withdrawalRequest.create({
        data: { userId, userDisplayId, amount, bankAccountId },
      });
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

  async sumInRange(userId: string, start: Date, end: Date) {
    const result = await this.prisma.transaction.aggregate({
      where: { userId, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

}
