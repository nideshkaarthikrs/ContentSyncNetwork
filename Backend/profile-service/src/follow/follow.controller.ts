import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowService } from './follow.service';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  follow(@Param('userId') userId: string, @Request() req) {
    return this.followService.follow(req.user.userId, userId);
  }

  @Delete(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unfollow(@Param('userId') userId: string, @Request() req) {
    return this.followService.unfollow(req.user.userId, userId);
  }

  @Get(':userId/followers')
  @HttpCode(HttpStatus.OK)
  getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }
}
