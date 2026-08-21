import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findListings(assetType: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    // Browse must only show what can actually be bought. Without the status
    // filter, SOLD listings stayed in the marketplace feed and every attempt to
    // buy one 404'd (findListingByAssetId already filters to AVAILABLE).
    const where: Record<string, any> = { status: 'AVAILABLE' as any };
    if (assetType) {
      where.assetType = assetType as any;
    }
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

  findMyListings(ownerId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      this.prisma.rightsListing.findMany({
        where: { ownerId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rightsListing.count({ where: { ownerId } }),
      this.prisma.rightsListing.count({ where: { ownerId, status: 'SOLD' as any } }),
    ]);
  }

  createListing(
    assetId: string,
    assetType: string,
    ownerId: string,
    ownerUserId: string,
    licenseType: string,
    price: number,
    territory?: string,
    term?: string,
  ) {
    return this.prisma.rightsListing.create({
      data: { assetId, assetType: assetType as any, ownerId, ownerUserId, licenseType: licenseType as any, price, territory, term },
    });
  }

  updateListingStatus(id: string, status: string) {
    return this.prisma.rightsListing.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async purchaseListing(
    listingId: string,
    assetId: string,
    licenseType: string,
    buyerId: string,
    buyerUserId: string,
    price: number,
    sellerId: string,
    sellerUserId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.rightsListing.updateMany({
        where: { id: listingId, status: 'AVAILABLE' as any },
        data: { status: 'SOLD' as any },
      });
      if (count !== 1) {
        return null;
      }
      return tx.purchase.create({
        data: { assetId, licenseType, buyerId, buyerUserId, price, sellerId, sellerUserId, status: 'COMPLETED' },
      });
    });
  }

  /**
   * Compensating action for a purchase whose payment leg failed: undoes exactly
   * what purchaseListing did, in one transaction, so the listing is never left
   * SOLD with no paid-for Purchase behind it. Both statements are scoped to the
   * ids purchaseListing just created/claimed, so this can't clobber a different
   * buyer's purchase.
   */
  async revertPurchase(purchaseId: string, listingId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.purchase.delete({ where: { id: purchaseId } });
      await tx.rightsListing.update({
        where: { id: listingId },
        data: { status: 'AVAILABLE' as any },
      });
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
