import { ForbiddenException } from '@nestjs/common';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let profileRepo: { findByUserId: jest.Mock; upsert: jest.Mock };
  let followRepo: { countFollowers: jest.Mock };
  let service: ProfileService;

  beforeEach(() => {
    profileRepo = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
    };
    followRepo = {
      countFollowers: jest.fn().mockResolvedValue(0),
    };
    service = new ProfileService(profileRepo as any, followRepo as any);
  });

  describe('getProfile', () => {
    it('throws ForbiddenException with CSN-PROFILE-PRIVATE when a non-owner views a private profile', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: false,
      });

      await expect(
        service.getProfile('USR000001', { userId: 'USR000002', name: 'X', roles: [] }),
      ).rejects.toMatchObject({
        response: { errorCode: 'CSN-PROFILE-PRIVATE' },
      });
      expect(followRepo.countFollowers).not.toHaveBeenCalled();
    });

    it('rejects with ForbiddenException instance for a non-owner viewing a private profile', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: false,
      });

      await expect(
        service.getProfile('USR000001', { userId: 'USR000002', name: 'X', roles: [] }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('succeeds when the owner views their own private profile', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: false,
        name: 'Owner',
        bio: 'bio',
        roles: [],
        primaryRole: null,
        rating: 0,
        pushNotificationsEnabled: true,
        avatarUrl: null,
      });

      await expect(
        service.getProfile('USR000001', { userId: 'USR000001', name: 'Owner', roles: [] }),
      ).resolves.toMatchObject({ userId: 'USR000001' });
    });

    it('throws ForbiddenException with CSN-PROFILE-PRIVATE when no requester is provided (anonymous GET)', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: false,
      });

      await expect(service.getProfile('USR000001')).rejects.toMatchObject({
        response: { errorCode: 'CSN-PROFILE-PRIVATE' },
      });
    });

    it('succeeds for a public profile regardless of requester', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: true,
        name: 'Owner',
        bio: 'bio',
        roles: [],
        primaryRole: null,
        rating: 0,
        pushNotificationsEnabled: true,
        avatarUrl: null,
      });

      await expect(
        service.getProfile('USR000001', { userId: 'USR000002', name: 'X', roles: [] }),
      ).resolves.toMatchObject({ userId: 'USR000001' });
    });

    it('includes bio in the getProfile response', async () => {
      profileRepo.findByUserId.mockResolvedValue({
        userId: 'USR000001',
        publicProfile: true,
        name: 'Owner',
        bio: 'Composer from Chennai',
        roles: [],
        primaryRole: null,
        rating: 0,
        pushNotificationsEnabled: true,
        avatarUrl: null,
      });

      const result = await service.getProfile('USR000001');
      expect(result.bio).toBe('Composer from Chennai');
    });
  });

  describe('updateProfile', () => {
    it('includes bio in the updateProfile response', async () => {
      profileRepo.upsert.mockResolvedValue({
        userId: 'USR000001',
        name: 'Owner',
        bio: 'Updated bio text',
        roles: [],
        primaryRole: null,
        rating: 0,
        publicProfile: true,
        pushNotificationsEnabled: true,
        avatarUrl: null,
      });

      const result = await service.updateProfile('USR000001', 'USR000001', {} as any);
      expect(result.bio).toBe('Updated bio text');
    });
  });
});
