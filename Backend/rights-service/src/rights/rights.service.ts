import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { InternalCallError, getInternal, postInternal, postInternalStrict } from '../shared/internal-http.client';
import { error } from '../shared/response.helper';
import { CreateListingDto } from './dto/create-listing.dto';
import { DrmTokenDto } from './dto/drm-token.dto';
import { PurchaseRightsDto } from './dto/purchase-rights.dto';
import { RaiseClaimDto } from './dto/raise-claim.dto';
import { RightsRepository } from './rights.repository';

function toListingDisplayId(seq: number): string {
  return 'LIC' + (8000 + seq).toString();
}

function toClaimDisplayId(seq: number): string {
  return 'CLM' + (9000 + seq).toString();
}

function toPurchaseDisplayId(seq: number): string {
  return 'PUR' + (15000 + seq).toString();
}

function parseClaimDisplayId(claimId: string): number {
  return parseInt(claimId.replace('CLM', ''), 10) - 9000;
}

@Injectable()
export class RightsService {
  private readonly logger = new Logger(RightsService.name);

  constructor(
    private readonly repo: RightsRepository,
    private readonly config: ConfigService,
  ) {}

  /**
   * Verifies the caller owns the asset they're listing, via the owning
   * service's internal owner endpoint. Fails closed: an unreachable service or
   * unknown asset both refuse the listing. SONG has no owning service in this
   * codebase, so ownership can't be verified — fail closed and reject the
   * listing rather than allow it through unchecked.
   */
  private async assertCallerOwnsAsset(userDisplayId: string, assetId: string, assetType: string) {
    let ownerUrl: string;
    if (assetType === 'TUNE') {
      ownerUrl = `${this.config.get<string>('tuneService.url')}/internal/tunes/${assetId}/owner`;
    } else if (assetType === 'VIDEO') {
      ownerUrl = `${this.config.get<string>('videoService.url')}/internal/videos/${assetId}/owner`;
    } else {
      throw new BadRequestException(error('CSN-RIGHTS-008', 'SONG assets cannot be listed — ownership cannot be verified'));
    }
    const owner = await getInternal<{ data: { ownerUserId: string } }>(
      ownerUrl,
      this.config.get<string>('internal.secret'),
    );
    if (!owner || owner.data.ownerUserId !== userDisplayId) {
      throw new ForbiddenException(error('CSN-RIGHTS-007', 'You can only list assets you own'));
    }
  }

  async createListing(user: { id: string; userId: string }, dto: CreateListingDto) {
    await this.assertCallerOwnsAsset(user.userId, dto.assetId, dto.assetType);
    const listing = await this.repo.createListing(
      dto.assetId,
      dto.assetType,
      user.id,
      user.userId,
      dto.licenseType,
      dto.price,
      dto.territory,
      dto.term,
    );
    return {
      status: 'SUCCESS',
      message: 'Listing created',
      data: {
        listingId: toListingDisplayId(listing.sequenceNumber),
        assetId: listing.assetId,
        status: listing.status,
      },
    };
  }

  async getListings(assetType: string | undefined, page: number, pageSize: number) {
    const [listings, total] = await this.repo.findListings(assetType, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'Listings retrieved',
      data: {
        page,
        pageSize,
        totalRecords: total,
        data: listings.map((l) => ({
          listingId: toListingDisplayId(l.sequenceNumber),
          assetId: l.assetId,
          assetType: l.assetType,
          licenseType: l.licenseType,
          territory: l.territory,
          term: l.term,
          price: l.price,
          status: l.status,
          createdAt: l.createdAt,
        })),
      },
    };
  }

  async getMyListings(ownerId: string, page: number, pageSize: number) {
    const [listings, total, soldCount] = await this.repo.findMyListings(ownerId, page, pageSize);
    return {
      status: 'SUCCESS',
      message: 'My listings retrieved',
      data: {
        page,
        pageSize,
        totalRecords: total,
        soldCount,
        data: listings.map((l) => ({
          listingId: toListingDisplayId(l.sequenceNumber),
          assetId: l.assetId,
          assetType: l.assetType,
          licenseType: l.licenseType,
          territory: l.territory,
          term: l.term,
          price: l.price,
          status: l.status,
          createdAt: l.createdAt,
        })),
      },
    };
  }

  async purchase(user: { id: string; userId: string }, dto: PurchaseRightsDto) {
    const listing = await this.repo.findListingByAssetId(dto.assetId);
    if (!listing) {
      throw new NotFoundException(error('CSN-RIGHTS-002', `No available listing for asset ${dto.assetId}`));
    }
    if (listing.ownerId === user.id) {
      throw new ForbiddenException(error('CSN-RIGHTS-003', 'You cannot purchase your own listing'));
    }
    if (dto.licenseType !== listing.licenseType) {
      throw new BadRequestException(error('CSN-RIGHTS-004', 'Requested license type does not match the listing'));
    }
    const purchase = await this.repo.purchaseListing(
      listing.id,
      dto.assetId,
      dto.licenseType,
      user.id,
      user.userId,
      listing.price,
      listing.ownerId,
      listing.ownerUserId,
    );
    if (!purchase) {
      throw new ConflictException(error('CSN-RIGHTS-005', 'Listing already sold'));
    }
    const purchaseId = toPurchaseDisplayId(purchase.sequenceNumber);

    // Money moves synchronously. This used to be a fire-and-forget POST that
    // only ever CREDITED the seller — the buyer was never debited and a failed
    // call was swallowed, so marketplace goods were free and the ledger could
    // silently lose the sale. The transfer endpoint writes both legs atomically
    // and refuses when the buyer can't cover the price; anything other than a
    // 2xx here means no money moved, so we undo the claim.
    try {
      await postInternalStrict(
        `${this.config.get<string>('paymentService.url')}/internal/transactions/transfer`,
        this.config.get<string>('internal.secret'),
        {
          buyerId: user.id,
          buyerUserId: user.userId,
          sellerId: listing.ownerId,
          sellerUserId: listing.ownerUserId,
          amount: listing.price,
          sourceId: dto.assetId,
          reference: purchaseId,
        },
      );
    } catch (err) {
      const callError = err as InternalCallError;
      if (callError.status === undefined) {
        // No response: payment-service may or may not have committed the
        // transfer. We still roll the purchase back (the buyer must not be left
        // owning something the ledger disagrees about), but this is the one
        // case that can need manual reconciliation, so make it findable.
        this.logger.error(
          `Transfer outcome UNKNOWN for ${purchaseId} (buyer ${user.userId}, seller ${listing.ownerUserId}, ` +
            `amount ${listing.price}): ${callError.message}. Rolling back the purchase — verify no buyer debit was written.`,
        );
      }
      try {
        await this.repo.revertPurchase(purchase.id, listing.id);
      } catch (revertErr) {
        // Compensation itself failed. The listing stays SOLD with a Purchase row
        // but (almost certainly) no buyer debit — a stuck listing, never a
        // double charge. Surface it as a 500 rather than reporting success.
        this.logger.error(
          `Compensation FAILED for ${purchaseId} (listing ${listing.id}) after a failed transfer: ` +
            `${(revertErr as Error).message}. Listing is stuck in SOLD and needs manual repair.`,
        );
        throw revertErr;
      }
      if (callError.errorCode === 'CSN-PAY-002') {
        throw new BadRequestException(error('CSN-RIGHTS-009', 'Insufficient balance to complete this purchase'));
      }
      throw new BadRequestException(error('CSN-RIGHTS-010', 'Payment could not be completed — the purchase was cancelled'));
    }

    // Notification stays fire-and-forget: a downed notification-service must not
    // fail (or roll back) a purchase whose money already moved.
    postInternal(`${this.config.get<string>('notificationService.url')}/internal/notifications`, this.config.get<string>('internal.secret'), {
      recipientUserId: listing.ownerUserId,
      type: 'MARKETPLACE_SALE',
      title: `Your rights listing sold for ₹${listing.price}`,
      sourceId: toListingDisplayId(listing.sequenceNumber),
    }).catch(() => {});
    return {
      status: 'SUCCESS',
      message: 'Purchase completed',
      data: {
        purchaseId,
        assetId: dto.assetId,
        licenseType: dto.licenseType,
        status: 'COMPLETED',
      },
    };
  }

  generateDrmToken(dto: DrmTokenDto) {
    const token = randomUUID();
    return {
      status: 'SUCCESS',
      message: 'DRM token generated',
      data: {
        streamUrl: `https://cdn.csn.ai/stream/${dto.assetId}?token=${token}`,
      },
    };
  }

  async raiseClaim(user: { id: string; userId: string }, dto: RaiseClaimDto) {
    const record = await this.repo.createClaim(dto.assetId, dto.reason, user.id, user.userId);
    const listing = await this.repo.findListingByAssetId(dto.assetId);
    if (listing) {
      postInternal(`${this.config.get<string>('notificationService.url')}/internal/notifications`, this.config.get<string>('internal.secret'), {
        recipientUserId: listing.ownerUserId,
        type: 'COPYRIGHT_CLAIM',
        title: 'A copyright claim was filed against your listing',
        sourceId: toClaimDisplayId(record.sequenceNumber),
      }).catch(() => {});
    }
    return {
      status: 'SUCCESS',
      message: 'Claim submitted',
      data: {
        claimId: toClaimDisplayId(record.sequenceNumber),
        status: record.status,
      },
    };
  }

  async getClaimById(claimId: string, user: { id: string; userId: string }) {
    const seq = parseClaimDisplayId(claimId);
    if (isNaN(seq)) {
      throw new NotFoundException(error('CSN-RIGHTS-001', `Claim ${claimId} not found`));
    }
    const record = await this.repo.findClaimBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException(error('CSN-RIGHTS-001', `Claim ${claimId} not found`));
    }
    if (record.claimantId !== user.id) {
      const listing = await this.repo.findListingByAssetId(record.assetId);
      if (!listing || listing.ownerId !== user.id) {
        throw new ForbiddenException(error('CSN-RIGHTS-006', 'You do not have access to this claim'));
      }
    }
    return {
      status: 'SUCCESS',
      message: 'Claim retrieved',
      data: {
        claimId: toClaimDisplayId(record.sequenceNumber),
        assetId: record.assetId,
        reason: record.reason,
        status: record.status,
        createdAt: record.createdAt,
      },
    };
  }
}
