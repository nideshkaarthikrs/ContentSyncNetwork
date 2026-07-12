import { BadRequestException, Injectable } from '@nestjs/common';
import { FollowRepository } from './follow.repository';

@Injectable()
export class FollowService {
  constructor(private readonly followRepo: FollowRepository) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException({
        status: 'ERROR',
        errorCode: 'CSN-2003',
        message: 'You cannot follow yourself',
      });
    }
    await this.followRepo.follow(followerId, followingId);
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
