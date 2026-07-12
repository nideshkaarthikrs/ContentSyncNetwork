import { Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('home')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  home(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.feedService.getFeed(page, pageSize, 'Home feed retrieved');
  }

  @Get('trending')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  trending(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.feedService.getFeed(page, pageSize, 'Trending feed retrieved');
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  recommended(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.feedService.getFeed(page, pageSize, 'Recommended feed retrieved');
  }
}
