import { Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
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
}
