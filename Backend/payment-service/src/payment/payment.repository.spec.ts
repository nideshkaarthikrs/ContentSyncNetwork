import { PaymentRepository } from './payment.repository';
import { TransactionType } from '@prisma/client';

/**
 * Unit tests for PaymentRepository's balance math. These deliberately do NOT
 * use Test.createTestingModule / a real Postgres connection — PaymentRepository
 * takes its dependency via plain constructor injection, so we hand it a fake
 * PrismaService whose `$transaction` invokes the passed callback with a fake
 * `tx` object we fully control. This lets us exercise the real
 * computeAvailableBalance math (private, reached only through the public
 * methods below) without any DB.
 */

type AggregateResult = { _sum: { amount: number | null } };

function buildFakeTx(opts: {
  creditsSum: number | null;
  purchasesSum: number | null;
  withdrawnSum: number | null;
  subscriptionFindFirst?: any;
}) {
  const transactionAggregate = jest.fn().mockImplementation(({ where }: any) => {
    if (where.type && where.type.in) {
      // credits: { in: [MARKETPLACE_SALE, ROYALTY] }
      return Promise.resolve<AggregateResult>({ _sum: { amount: opts.creditsSum } });
    }
    if (where.type === TransactionType.MARKETPLACE_PURCHASE) {
      return Promise.resolve<AggregateResult>({ _sum: { amount: opts.purchasesSum } });
    }
    throw new Error(`Unexpected transaction.aggregate where clause: ${JSON.stringify(where)}`);
  });

  const withdrawalRequestAggregate = jest.fn().mockResolvedValue({
    _sum: { amount: opts.withdrawnSum },
  } as AggregateResult);

  const transactionCreate = jest.fn().mockResolvedValue({ sequenceNumber: 1 });
  const withdrawalRequestCreate = jest.fn().mockResolvedValue({ sequenceNumber: 1, status: 'PENDING' });
  const subscriptionFindFirst = jest.fn().mockResolvedValue(opts.subscriptionFindFirst ?? null);
  const subscriptionCreate = jest.fn().mockResolvedValue({ sequenceNumber: 1, plan: 'PREMIUM', status: 'ACTIVE' });

  const tx = {
    $executeRaw: jest.fn().mockResolvedValue(undefined),
    transaction: {
      aggregate: transactionAggregate,
      create: transactionCreate,
    },
    withdrawalRequest: {
      aggregate: withdrawalRequestAggregate,
      create: withdrawalRequestCreate,
    },
    subscription: {
      findFirst: subscriptionFindFirst,
      create: subscriptionCreate,
    },
  };

  return tx;
}

function buildFakePrisma(tx: ReturnType<typeof buildFakeTx>) {
  return {
    $transaction: jest.fn().mockImplementation((callback: (tx: any) => Promise<any>) => callback(tx)),
  };
}

describe('PaymentRepository', () => {
  describe('createWithdrawalIfBalanceAllows', () => {
    it('allows a withdrawal exactly equal to available balance (1000 credits - 300 purchases - 200 withdrawn = 500)', async () => {
      const tx = buildFakeTx({ creditsSum: 1000, purchasesSum: 300, withdrawnSum: 200 });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createWithdrawalIfBalanceAllows('user-1', 'USR000001', 500, 'bank-1');

      expect(result).not.toBeNull();
      expect(tx.withdrawalRequest.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', userDisplayId: 'USR000001', amount: 500, bankAccountId: 'bank-1' },
      });
    });

    it('rejects a withdrawal of available+1 (500 available, requesting 501) and does not call create', async () => {
      const tx = buildFakeTx({ creditsSum: 1000, purchasesSum: 300, withdrawnSum: 200 });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createWithdrawalIfBalanceAllows('user-1', 'USR000001', 501, 'bank-1');

      expect(result).toBeNull();
      expect(tx.withdrawalRequest.create).not.toHaveBeenCalled();
    });

    it('correctly subtracts MARKETPLACE_PURCHASE from available balance (credits=1000, purchases=600, withdrawn=0 -> available=400; requesting 500 must be rejected)', async () => {
      // This is the P0.3 regression guard: if the purchases term were dropped
      // from computeAvailableBalance, available would wrongly be 1000, and a
      // withdrawal of 500 would incorrectly succeed.
      const tx = buildFakeTx({ creditsSum: 1000, purchasesSum: 600, withdrawnSum: 0 });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createWithdrawalIfBalanceAllows('user-1', 'USR000001', 500, 'bank-1');

      expect(result).toBeNull();
      expect(tx.withdrawalRequest.create).not.toHaveBeenCalled();
    });
  });

  describe('createTransferIfBalanceAllows', () => {
    it('allows a transfer exactly equal to available balance (500 credits, 0 purchases, 0 withdrawn = 500) and writes both paired rows', async () => {
      const tx = buildFakeTx({ creditsSum: 500, purchasesSum: 0, withdrawnSum: 0 });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createTransferIfBalanceAllows({
        buyerId: 'buyer-1',
        buyerUserId: 'USR000001',
        sellerId: 'seller-1',
        sellerUserId: 'USR000002',
        amount: 500,
        sourceId: 'RIGHT123',
        reference: 'ref-abc',
      });

      expect(result).toEqual({ debit: { sequenceNumber: 1 }, credit: { sequenceNumber: 1 } });
      expect(tx.transaction.create).toHaveBeenCalledTimes(2);
      expect(tx.transaction.create).toHaveBeenNthCalledWith(1, {
        data: {
          userId: 'buyer-1',
          userDisplayId: 'USR000001',
          type: TransactionType.MARKETPLACE_PURCHASE,
          amount: 500,
          sourceId: 'RIGHT123',
          reference: 'ref-abc',
        },
      });
      expect(tx.transaction.create).toHaveBeenNthCalledWith(2, {
        data: {
          userId: 'seller-1',
          userDisplayId: 'USR000002',
          type: TransactionType.MARKETPLACE_SALE,
          amount: 500,
          sourceId: 'RIGHT123',
          reference: 'ref-abc',
        },
      });
    });

    it('rejects a transfer of available+1 and writes neither the debit nor the credit row', async () => {
      const tx = buildFakeTx({ creditsSum: 500, purchasesSum: 0, withdrawnSum: 0 });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createTransferIfBalanceAllows({
        buyerId: 'buyer-1',
        buyerUserId: 'USR000001',
        sellerId: 'seller-1',
        sellerUserId: 'USR000002',
        amount: 501,
      });

      expect(result).toBeNull();
      expect(tx.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('createSubscriptionIfNoneActive', () => {
    it('returns null and creates nothing when an ACTIVE subscription already exists', async () => {
      const tx = buildFakeTx({
        creditsSum: 0,
        purchasesSum: 0,
        withdrawnSum: 0,
        subscriptionFindFirst: { id: 'existing-sub', status: 'ACTIVE' },
      });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createSubscriptionIfNoneActive('user-1', 'USR000001', 'PREMIUM' as any, 499);

      expect(result).toBeNull();
      expect(tx.subscription.create).not.toHaveBeenCalled();
      expect(tx.transaction.create).not.toHaveBeenCalled();
    });

    it('creates the subscription and its paired SUBSCRIPTION transaction row when none exists', async () => {
      const tx = buildFakeTx({
        creditsSum: 0,
        purchasesSum: 0,
        withdrawnSum: 0,
        subscriptionFindFirst: null,
      });
      const prisma = buildFakePrisma(tx);
      const repo = new PaymentRepository(prisma as any);

      const result = await repo.createSubscriptionIfNoneActive('user-1', 'USR000001', 'PREMIUM' as any, 499);

      expect(result).toEqual({ sequenceNumber: 1, plan: 'PREMIUM', status: 'ACTIVE' });
      expect(tx.subscription.create).toHaveBeenCalledTimes(1);
      expect(tx.transaction.create).toHaveBeenCalledTimes(1);
      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          userDisplayId: 'USR000001',
          type: TransactionType.SUBSCRIPTION,
          amount: 499,
          sourceId: 'SUB10001',
        },
      });
    });
  });
});
