import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { FollowRepository } from '../follow/follow.repository';
import { UPLOADS_ROOT } from '../shared/uploads-path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly followRepo: FollowRepository,
  ) {}

  async getProfile(userId: string, requester?: { userId: string; name: string; roles: string[] }) {
    let profile = await this.profileRepo.findByUserId(userId);

    if (!profile) {
      if (requester && requester.userId === userId) {
        profile = await this.profileRepo.upsert(userId, {
          name: requester.name || '',
          roles: requester.roles || [],
        });
      } else {
        throw new NotFoundException({
          status: 'ERROR',
          errorCode: 'CSN-2001',
          message: 'Profile not found',
        });
      }
    }

    if (profile.publicProfile === false && requester?.userId !== userId) {
      throw new ForbiddenException({
        status: 'ERROR',
        errorCode: 'CSN-PROFILE-PRIVATE',
        message: 'This profile is private',
      });
    }

    const followers = await this.followRepo.countFollowers(userId);

    return {
      userId: profile.userId,
      name: profile.name,
      bio: profile.bio,
      roles: profile.roles,
      primaryRole: profile.primaryRole,
      followers,
      rating: profile.rating,
      publicProfile: profile.publicProfile,
      pushNotificationsEnabled: profile.pushNotificationsEnabled,
      avatarUrl: profile.avatarUrl,
    };
  }

  async updateProfile(userId: string, requesterId: string, dto: UpdateProfileDto) {
    if (requesterId !== userId) {
      throw new ForbiddenException({
        status: 'ERROR',
        errorCode: 'CSN-2002',
        message: 'You can only update your own profile',
      });
    }

    const profile = await this.profileRepo.upsert(userId, dto);
    const followers = await this.followRepo.countFollowers(userId);

    return {
      userId: profile.userId,
      name: profile.name,
      bio: profile.bio,
      roles: profile.roles,
      primaryRole: profile.primaryRole,
      followers,
      rating: profile.rating,
      publicProfile: profile.publicProfile,
      pushNotificationsEnabled: profile.pushNotificationsEnabled,
      avatarUrl: profile.avatarUrl,
    };
  }

  async updatePhoto(userId: string, requesterId: string, filename: string) {
    if (requesterId !== userId) {
      throw new ForbiddenException({
        status: 'ERROR',
        errorCode: 'CSN-2002',
        message: 'You can only update your own profile',
      });
    }

    const existing = await this.profileRepo.findByUserId(userId);
    const avatarUrl = `/uploads/${filename}`;
    await this.profileRepo.updateAvatar(userId, avatarUrl);

    if (existing?.avatarUrl && existing.avatarUrl !== avatarUrl) {
      const oldFilename = existing.avatarUrl.replace(/^\/uploads\//, '');
      await unlink(join(UPLOADS_ROOT, oldFilename)).catch((err) => {
        if (err?.code !== 'ENOENT') {
          this.logger.warn(`Failed to delete old avatar for ${userId}: ${err.message}`);
        }
      });
    }

    return { status: 'SUCCESS', message: 'Photo uploaded', avatarUrl };
  }
}
