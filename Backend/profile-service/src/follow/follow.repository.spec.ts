import { FollowRepository } from './follow.repository';

describe('FollowRepository', () => {
  it('follow() calls prisma.follow.upsert with the exact upsert shape (no create+catch)', async () => {
    const prisma = {
      follow: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    const repo = new FollowRepository(prisma as any);

    await repo.follow('A', 'B');

    expect(prisma.follow.upsert).toHaveBeenCalledWith({
      where: { followerId_followingId: { followerId: 'A', followingId: 'B' } },
      create: { followerId: 'A', followingId: 'B' },
      update: {},
    });
  });
});
