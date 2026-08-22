import { RightsRepository } from './rights.repository';

/**
 * Unit tests for RightsRepository.findListings' status filter. Browse must
 * only show AVAILABLE listings — without this filter, SOLD listings stayed
 * in the marketplace feed and every attempt to buy one 404'd (P0.3). Prisma
 * is mocked as a plain object of jest.fn() methods, no real Postgres.
 */

function buildMockPrisma() {
  return {
    rightsListing: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
}

describe('RightsRepository.findListings', () => {
  it('filters to AVAILABLE listings when no assetType is given', async () => {
    const prisma = buildMockPrisma();
    const repo = new RightsRepository(prisma as any);

    await repo.findListings(undefined, 1, 20);

    expect(prisma.rightsListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'AVAILABLE' }) }),
    );
    expect(prisma.rightsListing.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'AVAILABLE' }) }),
    );
  });

  it('adds assetType to the where clause alongside the AVAILABLE status filter, not replacing it', async () => {
    const prisma = buildMockPrisma();
    const repo = new RightsRepository(prisma as any);

    await repo.findListings('TUNE', 1, 20);

    expect(prisma.rightsListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE', assetType: 'TUNE' }),
      }),
    );
    expect(prisma.rightsListing.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'AVAILABLE', assetType: 'TUNE' }),
      }),
    );
  });
});
