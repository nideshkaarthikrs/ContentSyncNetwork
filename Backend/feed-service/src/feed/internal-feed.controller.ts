import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { CreateFeedItemDto } from './dto/create-feed-item.dto';
import { FeedService } from './feed.service';

@Controller('internal/feed-items')
export class InternalFeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  record(@Body() dto: CreateFeedItemDto) {
    return this.feedService.recordItem(dto);
  }
}
