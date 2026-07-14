import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { postInternal } from '../shared/internal-http.client';
import { FollowRepository } from './follow.repository';

@Injectable()
export class FollowService {
  constructor(
    private readonly followRepo: FollowRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException({
        status: 'ERROR',
        errorCode: 'CSN-2003',
        message: 'You cannot follow yourself',
      });
    }
    const alreadyFollowing = await this.followRepo.exists(followerId, followingId);
    await this.followRepo.follow(followerId, followingId);

    if (!alreadyFollowing) {
      const followerProfile = await this.prisma.profile.findUnique({ where: { userId: followerId } });
      postInternal(`${this.config.get<string>('notificationService.url')}/internal/notifications`, this.config.get<string>('internal.secret'), {
        recipientUserId: followingId,
        type: 'FOLLOW',
        title: `${followerProfile?.name || 'Someone'} started following you`,
        sourceId: followerId,
      }).catch(() => {});
    }

    return { status: 'SUCCESS', message: 'Followed successfully' };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.followRepo.unfollow(followerId, followingId);
    return { status: 'SUCCESS', message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    const followers = await this.followRepo.getFollowers(userId);
    return { status: 'SUCCESS', message: 'Followers retrieved', data: followers };
  }
}
