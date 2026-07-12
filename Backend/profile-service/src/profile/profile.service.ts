import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FollowRepository } from '../follow/follow.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
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

    const followers = await this.followRepo.countFollowers(userId);

    return {
      userId: profile.userId,
      name: profile.name,
      roles: profile.roles,
      followers,
      rating: profile.rating,
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
      roles: profile.roles,
      followers,
      rating: profile.rating,
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

    const avatarUrl = `/uploads/${filename}`;
    await this.profileRepo.updateAvatar(userId, avatarUrl);
    return { status: 'SUCCESS', message: 'Photo uploaded', avatarUrl };
  }
}
