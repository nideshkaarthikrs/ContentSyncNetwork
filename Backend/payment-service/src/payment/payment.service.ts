import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';
import { error, success } from '../shared/response.helper';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { RecordTransactionDto } from './dto/record-transaction.dto';
import { TransferDto } from './dto/transfer.dto';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { PaymentRepository, toSubscriptionDisplayId } from './payment.repository';

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
    // Repeated POSTs used to stack ACTIVE subscriptions (and SUBSCRIPTION charges)
    // without limit. There is no plan-change/upgrade flow in this codebase, so the
    // only correct answer to "you already have an active plan" is to refuse.
    const sub = await this.repo.createSubscriptionIfNoneActive(user.id, user.userId, plan, amount);
    if (!sub) {
      throw new ConflictException(error('CSN-PAY-003', 'You already have an active subscription'));
    }
    return success('Subscription created', {
      data: { subscriptionId: toSubscriptionDisplayId(sub.sequenceNumber), plan: sub.plan, status: sub.status },
    });
  }

  /**
   * Internal, service-to-service only. Debits the buyer and credits the seller
   * in one DB transaction under the buyer's advisory lock — see
   * PaymentRepository.createTransferIfBalanceAllows. A 400 CSN-PAY-002 here
   * means definitively that no ledger rows were written.
   */
  async transfer(dto: TransferDto) {
    const result = await this.repo.createTransferIfBalanceAllows({
      buyerId: dto.buyerId,
      buyerUserId: dto.buyerUserId,
      sellerId: dto.sellerId,
      sellerUserId: dto.sellerUserId,
      amount: dto.amount,
      sourceId: dto.sourceId,
      reference: dto.reference,
    });
    if (!result) {
      throw new BadRequestException(error('CSN-PAY-002', 'Insufficient available balance'));
    }
    return success('Transfer recorded', {
      data: {
        debitTransactionId: 'TXN' + (13000 + result.debit.sequenceNumber),
        creditTransactionId: 'TXN' + (13000 + result.credit.sequenceNumber),
      },
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
    // The user's own plan payment is an expense, not revenue for them — it used
    // to be added into totalRevenue, which overstated every subscriber's
    // earnings by their own plan price. Reported separately now.
    const subscriptionSpend = byType['SUBSCRIPTION'] ?? 0;
    const marketplaceSales = byType['MARKETPLACE_SALE'] ?? 0;
    const royalties = byType['ROYALTY'] ?? 0;
    const availableBalance = await this.repo.getAvailableBalance(user.id);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonth, lastMonth] = await Promise.all([
      this.repo.sumInRange(user.id, startOfThisMonth, startOfNextMonth),
      this.repo.sumInRange(user.id, startOfLastMonth, startOfThisMonth),
    ]);
    const growthPercent = lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

    // `royalties` now reports the real ROYALTY transaction sum rather than a
    // hardcoded 0, so it agrees with availableBalance (which counts ROYALTY as a
    // credit). In practice it is still 0 — nothing in this codebase creates
    // ROYALTY rows yet. `contestWins` stays hardcoded 0: there is no contest or
    // prize feature anywhere to generate it from.
    return success('Revenue dashboard retrieved', {
      data: {
        totalRevenue: marketplaceSales + royalties,
        growthPercent,
        revenueBreakdown: {
          subscriptions: subscriptionSpend,
          marketplaceSales,
        },
        royalties,
        marketplaceSales,
        subscriptionSpend,
        availableBalance,
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
