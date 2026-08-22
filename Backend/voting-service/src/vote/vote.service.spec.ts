import { VoteService } from './vote.service';

/**
 * Unit tests for VoteService.getResults() (P0.4 — zero-vote rank null).
 * VoteRepository is mocked as a plain object of jest.fn() methods (no real
 * Prisma/Postgres). ConfigService is unused by getResults, so a minimal stub
 * is enough.
 */

function buildMockRepo() {
  return {
    create: jest.fn(),
    countByEntityId: jest.fn(),
    findOneByEntityId: jest.fn(),
    countEntitiesWithMoreVotes: jest.fn(),
  };
}

function buildMockConfig() {
  return { get: jest.fn() };
}

describe('VoteService.getResults', () => {
  it('returns votes: 0, rank: null for an entity with zero votes, without computing a rank', async () => {
    const repo = buildMockRepo();
    repo.countByEntityId.mockResolvedValue(0);
    const service = new VoteService(repo as any, buildMockConfig() as any);

    const result = await service.getResults('SOME_ID');

    expect(result).toEqual({
      status: 'SUCCESS',
      message: 'Voting results retrieved',
      data: { entityId: 'SOME_ID', votes: 0, rank: null },
    });
    expect(repo.findOneByEntityId).not.toHaveBeenCalled();
    expect(repo.countEntitiesWithMoreVotes).not.toHaveBeenCalled();
  });

  it('returns rank 1 when the entity has votes and no one else is ahead', async () => {
    const repo = buildMockRepo();
    repo.countByEntityId.mockResolvedValue(5);
    repo.findOneByEntityId.mockResolvedValue({ entityType: 'TUNE' });
    repo.countEntitiesWithMoreVotes.mockResolvedValue(0);
    const service = new VoteService(repo as any, buildMockConfig() as any);

    const result = await service.getResults('SOME_ID');

    expect(result.data.votes).toBe(5);
    expect(result.data.rank).toBe(1);
    expect(repo.countEntitiesWithMoreVotes).toHaveBeenCalledWith('TUNE', 5);
  });

  it('computes rank as entitiesAhead + 1 when others are ahead', async () => {
    const repo = buildMockRepo();
    repo.countByEntityId.mockResolvedValue(5);
    repo.findOneByEntityId.mockResolvedValue({ entityType: 'TUNE' });
    repo.countEntitiesWithMoreVotes.mockResolvedValue(3);
    const service = new VoteService(repo as any, buildMockConfig() as any);

    const result = await service.getResults('SOME_ID');

    expect(result.data.rank).toBe(4);
  });
});
