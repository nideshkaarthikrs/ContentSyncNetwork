import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { error } from '../shared/response.helper';
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

function parseClaimDisplayId(claimId: string): number {
  return parseInt(claimId.replace('CLM', ''), 10) - 9000;
}

@Injectable()
export class RightsService {
  constructor(private readonly repo: RightsRepository) {}

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

  async purchase(user: { id: string; userId: string }, dto: PurchaseRightsDto) {
    const listing = await this.repo.findListingByAssetId(dto.assetId);
    if (listing) {
      await this.repo.updateListingStatus(listing.id, 'PENDING');
    }
    await this.repo.createPurchase(dto.assetId, dto.licenseType, user.id, user.userId);
    return {
      status: 'SUCCESS',
      message: 'Purchase initiated',
      data: {
        assetId: dto.assetId,
        licenseType: dto.licenseType,
        status: 'PENDING',
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
    return {
      status: 'SUCCESS',
      message: 'Claim submitted',
      data: {
        claimId: toClaimDisplayId(record.sequenceNumber),
        status: record.status,
      },
    };
  }

  async getClaimById(claimId: string) {
    const seq = parseClaimDisplayId(claimId);
    const record = await this.repo.findClaimBySequenceNumber(seq);
    if (!record) {
      throw new NotFoundException(error('CSN-RIGHTS-001', `Claim ${claimId} not found`));
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
