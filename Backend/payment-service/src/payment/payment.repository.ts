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

  createWithdrawal(userId: string, userDisplayId: string, amount: number, bankAccountId: string) {
    return this.prisma.withdrawalRequest.create({
      data: { userId, userDisplayId, amount, bankAccountId },
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

  async sumWithdrawn(userId: string) {
    const result = await this.prisma.withdrawalRequest.aggregate({
      where: { userId, status: { not: 'FAILED' } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }
}
