import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InternalCallError, getInternal, postInternal, postInternalStrict } from '../shared/internal-http.client';
import { RightsService } from './rights.service';

/**
 * Unit tests for RightsService's own logic: purchase() compensation on
 * transfer failure (P0.3), SONG rejection in createListing() (P0.2), and
 * claim visibility in getClaimById() (P0.2). RightsRepository is mocked as a
 * plain object of jest.fn() methods (no real Prisma/Postgres — that's
 * rights.repository.spec.ts) and ../shared/internal-http.client is jest.mock'd
 * so the money/ownership network calls are fully controlled per test.
 */

jest.mock('../shared/internal-http.client', () => ({
  ...jest.requireActual('../shared/internal-http.client'),
  getInternal: jest.fn(),
  postInternal: jest.fn(),
  postInternalStrict: jest.fn(),
}));

const mockedGetInternal = jest.mocked(getInternal);
const mockedPostInternal = jest.mocked(postInternal);
const mockedPostInternalStrict = jest.mocked(postInternalStrict);

function buildMockRepo() {
  return {
    findListingByAssetId: jest.fn(),
    purchaseListing: jest.fn(),
    revertPurchase: jest.fn(),
    createListing: jest.fn(),
    findListings: jest.fn(),
    findMyListings: jest.fn(),
    updateListingStatus: jest.fn(),
    createClaim: jest.fn(),
    findClaimBySequenceNumber: jest.fn(),
  };
}

function buildMockConfig() {
  return { get: jest.fn().mockReturnValue('dummy-value') };
}

const user = { id: 'buyer-1', userId: 'USR000001' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RightsService.purchase', () => {
  const dto = { assetId: 'asset-1', licenseType: 'NON_EXCLUSIVE' } as any;
  const listing = {
    id: 'listing-1',
    ownerId: 'seller-1',
    ownerUserId: 'USR000002',
    licenseType: 'NON_EXCLUSIVE',
    price: 500,
    sequenceNumber: 1,
  };
  const purchase = { id: 'purchase-1', sequenceNumber: 1 };

  it('completes on the happy path: success envelope, notification fired, no revert', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(listing);
    repo.purchaseListing.mockResolvedValue(purchase);
    mockedPostInternalStrict.mockResolvedValue(null);
    mockedPostInternal.mockResolvedValue(undefined);
    const service = new RightsService(repo as any, buildMockConfig() as any);

    const result = await service.purchase(user, dto);

    expect(result).toMatchObject({
      status: 'SUCCESS',
      data: { purchaseId: 'PUR15001', assetId: 'asset-1', licenseType: 'NON_EXCLUSIVE', status: 'COMPLETED' },
    });
    expect(mockedPostInternal).toHaveBeenCalledTimes(1);
    expect(repo.revertPurchase).not.toHaveBeenCalled();
  });

  it('reverts the purchase and throws CSN-RIGHTS-009 when the transfer fails with insufficient balance', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(listing);
    repo.purchaseListing.mockResolvedValue(purchase);
    mockedPostInternalStrict.mockRejectedValue(new InternalCallError('insufficient', 400, 'CSN-PAY-002'));
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(BadRequestException);
    expect(repo.revertPurchase).toHaveBeenCalledWith(purchase.id, listing.id);

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-009',
      });
    }
  });

  it('reverts the purchase and throws CSN-RIGHTS-010 when the transfer fails with a different/unknown error code', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(listing);
    repo.purchaseListing.mockResolvedValue(purchase);
    mockedPostInternalStrict.mockRejectedValue(new InternalCallError('boom', 500, 'SOME-OTHER-CODE'));
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(BadRequestException);
    expect(repo.revertPurchase).toHaveBeenCalledWith(purchase.id, listing.id);

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-010',
      });
    }
  });

  it('reverts the purchase and throws CSN-RIGHTS-010 when the transfer outcome is indeterminate (no status)', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(listing);
    repo.purchaseListing.mockResolvedValue(purchase);
    mockedPostInternalStrict.mockRejectedValue(new InternalCallError('network error'));
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(BadRequestException);
    expect(repo.revertPurchase).toHaveBeenCalledWith(purchase.id, listing.id);

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-010',
      });
    }
  });

  it('rejects a self-purchase with CSN-RIGHTS-003 before any state change', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue({ ...listing, ownerId: user.id });
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(ForbiddenException);
    expect(repo.purchaseListing).not.toHaveBeenCalled();

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect((e as ForbiddenException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-003',
      });
    }
  });

  it('throws CSN-RIGHTS-002 when no listing is found for the asset', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(null);
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(NotFoundException);

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(NotFoundException);
      expect((e as NotFoundException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-002',
      });
    }
  });

  it('throws ConflictException with CSN-RIGHTS-005 when the listing was already sold (repo returns null)', async () => {
    const repo = buildMockRepo();
    repo.findListingByAssetId.mockResolvedValue(listing);
    repo.purchaseListing.mockResolvedValue(null);
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.purchase(user, dto)).rejects.toThrow(ConflictException);

    try {
      await service.purchase(user, dto);
      fail('expected purchase to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ConflictException);
      expect((e as ConflictException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-005',
      });
    }
  });
});

describe('RightsService.createListing — SONG rejection', () => {
  it('rejects a SONG listing with CSN-RIGHTS-008 without calling getInternal or repo.createListing', async () => {
    const repo = buildMockRepo();
    const service = new RightsService(repo as any, buildMockConfig() as any);
    const dto = { assetId: 'asset-1', assetType: 'SONG', licenseType: 'NON_EXCLUSIVE', price: 100 } as any;

    await expect(service.createListing(user, dto)).rejects.toThrow(BadRequestException);
    expect(mockedGetInternal).not.toHaveBeenCalled();
    expect(repo.createListing).not.toHaveBeenCalled();

    try {
      await service.createListing(user, dto);
      fail('expected createListing to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as BadRequestException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-008',
      });
    }
  });

  it('creates a listing for a TUNE the caller owns (contrast: SONG rejection is not "always throws")', async () => {
    const repo = buildMockRepo();
    repo.createListing.mockResolvedValue({ sequenceNumber: 1, assetId: 'asset-1', status: 'AVAILABLE' });
    mockedGetInternal.mockResolvedValue({ data: { ownerUserId: user.userId } });
    const service = new RightsService(repo as any, buildMockConfig() as any);
    const dto = { assetId: 'asset-1', assetType: 'TUNE', licenseType: 'NON_EXCLUSIVE', price: 100 } as any;

    await expect(service.createListing(user, dto)).resolves.toMatchObject({ status: 'SUCCESS' });
    expect(repo.createListing).toHaveBeenCalled();
  });
});

describe('RightsService.getClaimById — claim visibility', () => {
  const claimId = 'CLM9001';
  const record = {
    sequenceNumber: 1,
    assetId: 'asset-1',
    reason: 'infringement',
    status: 'PENDING',
    createdAt: new Date(),
    claimantId: 'claimant-1',
  };

  it('lets the claimant view their own claim without looking up the listing', async () => {
    const repo = buildMockRepo();
    repo.findClaimBySequenceNumber.mockResolvedValue({ ...record, claimantId: user.id });
    const service = new RightsService(repo as any, buildMockConfig() as any);

    const result = await service.getClaimById(claimId, user);

    expect(result).toMatchObject({ status: 'SUCCESS', data: { claimId } });
    expect(repo.findListingByAssetId).not.toHaveBeenCalled();
  });

  it('lets the listing owner (not the claimant) view the claim', async () => {
    const repo = buildMockRepo();
    repo.findClaimBySequenceNumber.mockResolvedValue(record);
    repo.findListingByAssetId.mockResolvedValue({ ownerId: user.id });
    const service = new RightsService(repo as any, buildMockConfig() as any);

    const result = await service.getClaimById(claimId, user);

    expect(result).toMatchObject({ status: 'SUCCESS', data: { claimId } });
  });

  it('forbids a user who is neither the claimant nor the listing owner', async () => {
    const repo = buildMockRepo();
    repo.findClaimBySequenceNumber.mockResolvedValue(record);
    repo.findListingByAssetId.mockResolvedValue({ ownerId: 'someone-else' });
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.getClaimById(claimId, user)).rejects.toThrow(ForbiddenException);

    try {
      await service.getClaimById(claimId, user);
      fail('expected getClaimById to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect((e as ForbiddenException).getResponse()).toMatchObject({
        status: 'ERROR',
        errorCode: 'CSN-RIGHTS-006',
      });
    }
  });

  it('forbids a user when there is no listing at all for the claimed asset', async () => {
    const repo = buildMockRepo();
    repo.findClaimBySequenceNumber.mockResolvedValue(record);
    repo.findListingByAssetId.mockResolvedValue(null);
    const service = new RightsService(repo as any, buildMockConfig() as any);

    await expect(service.getClaimById(claimId, user)).rejects.toThrow(ForbiddenException);
  });
});
