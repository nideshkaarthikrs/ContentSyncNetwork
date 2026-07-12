import { Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { success } from '../shared/response.helper';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
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
    return success('Subscription created', {
      data: { subscriptionId, plan: sub.plan, status: sub.status },
    });
  }

  async handleWebhook(dto: WebhookEventDto) {
    await this.repo.createWebhookEvent(dto.eventType, dto.payload);
    return success('Webhook received');
  }

  getRevenueDashboard() {
    return success('Revenue dashboard retrieved', {
      data: { totalRevenue: 0, royalties: 0, marketplaceSales: 0, contestWins: 0 },
    });
  }

  async withdraw(user: { id: string; userId: string }, dto: WithdrawDto) {
    const req = await this.repo.createWithdrawal(user.id, user.userId, dto.amount, dto.bankAccountId);
    const withdrawalId = 'WDR' + (11000 + req.sequenceNumber);
    return success('Withdrawal initiated', {
      data: { withdrawalId, status: req.status },
    });
  }
}
