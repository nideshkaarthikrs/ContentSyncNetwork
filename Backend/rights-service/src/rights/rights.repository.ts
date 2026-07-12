import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findListings(assetType: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where = assetType ? { assetType: assetType as any } : {};
    return Promise.all([
      this.prisma.rightsListing.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rightsListing.count({ where }),
    ]);
  }

  findListingByAssetId(assetId: string) {
    return this.prisma.rightsListing.findFirst({
      where: { assetId, status: 'AVAILABLE' as any },
    });
  }

  updateListingStatus(id: string, status: string) {
    return this.prisma.rightsListing.update({
      where: { id },
      data: { status: status as any },
    });
  }

  createPurchase(assetId: string, licenseType: string, buyerId: string, buyerUserId: string) {
    return this.prisma.purchase.create({
      data: { assetId, licenseType, buyerId, buyerUserId },
    });
  }

  createClaim(assetId: string, reason: string, claimantId: string, claimantUserId: string) {
    return this.prisma.copyrightClaim.create({
      data: { assetId, reason, claimantId, claimantUserId },
    });
  }

  findClaimBySequenceNumber(seq: number) {
    return this.prisma.copyrightClaim.findFirst({ where: { sequenceNumber: seq } });
  }
}
