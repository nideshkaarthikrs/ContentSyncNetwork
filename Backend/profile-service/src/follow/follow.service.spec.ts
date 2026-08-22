import { BadRequestException } from '@nestjs/common';
import { postInternal } from '../shared/internal-http.client';
import { FollowService } from './follow.service';

jest.mock('../shared/internal-http.client');

const mockedPostInternal = postInternal as jest.MockedFunction<typeof postInternal>;

describe('FollowService', () => {
  let followRepo: { exists: jest.Mock; follow: jest.Mock };
  let prisma: { profile: { findUnique: jest.Mock } };
  let config: { get: jest.Mock };
  let service: FollowService;

  beforeEach(() => {
    jest.clearAllMocks();
    followRepo = {
      exists: jest.fn(),
      follow: jest.fn().mockResolvedValue({}),
    };
    prisma = {
      profile: {
        findUnique: jest.fn().mockResolvedValue({ name: 'Someone' }),
      },
    };
    config = {
      get: jest.fn().mockReturnValue('dummy'),
    };
    mockedPostInternal.mockResolvedValue(undefined as any);
    service = new FollowService(followRepo as any, prisma as any, config as any);
  });

  it('follows and fires the notification when not already following', async () => {
    followRepo.exists.mockResolvedValue(false);

    const result = await service.follow('USR000001', 'USR000002');

    expect(followRepo.follow).toHaveBeenCalledWith('USR000001', 'USR000002');
    expect(prisma.profile.findUnique).toHaveBeenCalled();
    expect(mockedPostInternal).toHaveBeenCalled();
    expect(result).toEqual({ status: 'SUCCESS', message: 'Followed successfully' });
  });

  it('is idempotent on re-follow: still calls follow, but does not re-notify, and does not throw', async () => {
    followRepo.exists.mockResolvedValue(true);

    await expect(service.follow('USR000001', 'USR000002')).resolves.toEqual({
      status: 'SUCCESS',
      message: 'Followed successfully',
    });

    expect(followRepo.follow).toHaveBeenCalledWith('USR000001', 'USR000002');
    expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    expect(mockedPostInternal).not.toHaveBeenCalled();
  });

  it('rejects self-follow with BadRequestException/CSN-2003 without touching followRepo', async () => {
    await expect(service.follow('USR000001', 'USR000001')).rejects.toMatchObject({
      response: { errorCode: 'CSN-2003' },
    });
    await expect(service.follow('USR000001', 'USR000001')).rejects.toBeInstanceOf(BadRequestException);

    expect(followRepo.exists).not.toHaveBeenCalled();
    expect(followRepo.follow).not.toHaveBeenCalled();
  });
});
