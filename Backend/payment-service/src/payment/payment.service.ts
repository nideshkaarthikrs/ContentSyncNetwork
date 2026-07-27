import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { error, success } from '../shared/response.helper';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { PaymentRepository } from './payment.repository';

const PLAN_AMOUNTS: Record<SubscriptionPlan, number> = {
  FREE: 0,
  PREMIUM: 499,
  PRODUCER: 10000,
};

@Injectable()
export class PaymentService {
  constructor(private readonly repo: PaymentRepository) {}

  async createSubscription(user: { id: string; userId: string }, dto: CreateSubscriptionDto) {
    const plan = dto.plan as SubscriptionPlan;
    const amount = PLAN_AMOUNTS[plan];
    const sub = await this.repo.createSubscription(user.id, user.userId, plan, amount);
    const subscriptionId = 'SUB' + (10000 + sub.sequenceNumber);
    // Note: a subscription payment is technically the paying user's own expense, not
    // revenue for them — recorded as a Transaction anyway per product decision, so the
    // dashboard's totalRevenue includes it. Flagging so this isn't mistaken for a bug.
    await this.repo.createTransaction(user.id, user.userId, 'SUBSCRIPTION', amount, subscriptionId);
    return success('Subscription created', {
      data: { subscriptionId, plan: sub.plan, status: sub.status },
    });
  }

  async handleWebhook(dto: WebhookEventDto) {
    await this.repo.createWebhookEvent(dto.eventType, dto.payload);
    return success('Webhook received');
  }

  async recordTransaction(dto: RecordTransactionDto) {
    const txn = await this.repo.createTransaction(dto.userId, dto.userDisplayId, dto.type as any, dto.amount, dto.sourceId, dto.reference);
    return success('Transaction recorded', {
      data: { transactionId: 'TXN' + (13000 + txn.sequenceNumber) },
    });
  }

  async getRevenueDashboard(user: { id: string; userId: string }) {
    const sums = await this.repo.sumByType(user.id);
    const byType = Object.fromEntries(sums.map((s) => [s.type, s._sum.amount ?? 0]));
    const subscriptionRevenue = byType['SUBSCRIPTION'] ?? 0;
    const marketplaceSales = byType['MARKETPLACE_SALE'] ?? 0;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonth, lastMonth] = await Promise.all([
      this.repo.sumInRange(user.id, startOfThisMonth, startOfNextMonth),
      this.repo.sumInRange(user.id, startOfLastMonth, startOfThisMonth),
    ]);
    const growthPercent = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    // royalties/contestWins stay hardcoded 0 — no royalty-distribution or
    // contest/prize feature exists anywhere in this codebase to generate them from.
    return success('Revenue dashboard retrieved', {
      data: {
        totalRevenue: subscriptionRevenue + marketplaceSales,
        growthPercent,
        revenueBreakdown: {
          subscriptions: subscriptionRevenue,
          marketplaceSales,
        },
        royalties: 0,
        marketplaceSales,
        contestWins: 0,
      },
    });
  }

  async withdraw(user: { id: string; userId: string }, dto: WithdrawDto) {
    const req = await this.repo.createWithdrawalIfBalanceAllows(user.id, user.userId, dto.amount, dto.bankAccountId);
    if (!req) {
      throw new BadRequestException(error('CSN-PAY-001', 'Insufficient available balance'));
    }
    const withdrawalId = 'WDR' + (11000 + req.sequenceNumber);
    return success('Withdrawal initiated', {
      data: { withdrawalId, status: req.status },
    });
  }
}
