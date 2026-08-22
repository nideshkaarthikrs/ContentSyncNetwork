import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentService } from './payment.service';

/**
 * Unit tests for PaymentService's own logic: call the repo, map a null result
 * to the right typed HTTP exception with the right error code, or build the
 * success envelope. PaymentRepository is mocked as a plain object of
 * jest.fn() methods (no fake-Prisma here — that's payment.repository.spec.ts).
 */

function buildMockRepo() {
  return {
    createSubscriptionIfNoneActive: jest.fn(),
    createTransferIfBalanceAllows: jest.fn(),
    createWithdrawalIfBalanceAllows: jest.fn(),
  };
}

describe('PaymentService', () => {
  describe('createSubscription', () => {
    it('throws ConflictException with CSN-PAY-003 when the repo returns null (already active subscription)', async () => {
      const repo = buildMockRepo();
      repo.createSubscriptionIfNoneActive.mockResolvedValue(null);
      const service = new PaymentService(repo as any);

      const user = { id: 'user-1', userId: 'USR000001' };
      const dto = { plan: 'PREMIUM' } as any;

      await expect(service.createSubscription(user, dto)).rejects.toThrow(ConflictException);

      try {
        await service.createSubscription(user, dto);
        fail('expected createSubscription to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        const response = (e as ConflictException).getResponse();
        expect(response).toMatchObject({
          status: 'ERROR',
          errorCode: 'CSN-PAY-003',
        });
      }
    });

    it('returns a success envelope with the derived subscriptionId when the repo succeeds', async () => {
      const repo = buildMockRepo();
      repo.createSubscriptionIfNoneActive.mockResolvedValue({ sequenceNumber: 1, plan: 'PREMIUM', status: 'ACTIVE' });
      const service = new PaymentService(repo as any);

      const result = await service.createSubscription({ id: 'user-1', userId: 'USR000001' }, { plan: 'PREMIUM' } as any);

      expect(result).toMatchObject({
        status: 'SUCCESS',
        data: { subscriptionId: 'SUB10001', plan: 'PREMIUM', status: 'ACTIVE' },
      });
    });
  });

  describe('transfer', () => {
    it('throws BadRequestException with CSN-PAY-002 when the repo returns null (insufficient balance)', async () => {
      const repo = buildMockRepo();
      repo.createTransferIfBalanceAllows.mockResolvedValue(null);
      const service = new PaymentService(repo as any);

      const dto = {
        buyerId: 'buyer-1',
        buyerUserId: 'USR000001',
        sellerId: 'seller-1',
        sellerUserId: 'USR000002',
        amount: 500,
      } as any;

      await expect(service.transfer(dto)).rejects.toThrow(BadRequestException);

      try {
        await service.transfer(dto);
        fail('expected transfer to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        const response = (e as BadRequestException).getResponse();
        expect(response).toMatchObject({
          status: 'ERROR',
          errorCode: 'CSN-PAY-002',
        });
      }
    });

    it('returns a success envelope with the derived debit/credit transaction ids when the repo succeeds', async () => {
      const repo = buildMockRepo();
      repo.createTransferIfBalanceAllows.mockResolvedValue({
        debit: { sequenceNumber: 1 },
        credit: { sequenceNumber: 2 },
      });
      const service = new PaymentService(repo as any);

      const dto = {
        buyerId: 'buyer-1',
        buyerUserId: 'USR000001',
        sellerId: 'seller-1',
        sellerUserId: 'USR000002',
        amount: 500,
      } as any;

      const result = await service.transfer(dto);

      expect(result).toMatchObject({
        status: 'SUCCESS',
        data: { debitTransactionId: 'TXN13001', creditTransactionId: 'TXN13002' },
      });
    });
  });

  describe('withdraw', () => {
    it('throws BadRequestException with CSN-PAY-001 when the repo returns null (insufficient balance)', async () => {
      const repo = buildMockRepo();
      repo.createWithdrawalIfBalanceAllows.mockResolvedValue(null);
      const service = new PaymentService(repo as any);

      const user = { id: 'user-1', userId: 'USR000001' };
      const dto = { amount: 500, bankAccountId: 'bank-1' } as any;

      await expect(service.withdraw(user, dto)).rejects.toThrow(BadRequestException);

      try {
        await service.withdraw(user, dto);
        fail('expected withdraw to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        const response = (e as BadRequestException).getResponse();
        expect(response).toMatchObject({
          status: 'ERROR',
          errorCode: 'CSN-PAY-001',
        });
      }
    });

    it('returns a success envelope with the derived withdrawalId when the repo succeeds', async () => {
      const repo = buildMockRepo();
      repo.createWithdrawalIfBalanceAllows.mockResolvedValue({ sequenceNumber: 1, status: 'PENDING' });
      const service = new PaymentService(repo as any);

      const result = await service.withdraw({ id: 'user-1', userId: 'USR000001' }, { amount: 500, bankAccountId: 'bank-1' } as any);

      expect(result).toMatchObject({
        status: 'SUCCESS',
        data: { withdrawalId: 'WDR11001', status: 'PENDING' },
      });
    });
  });
});
