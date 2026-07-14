import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { clampPagination } from '../shared/pagination.helper';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  list(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    const clamped = clampPagination(page, pageSize);
    return this.notificationService.getNotifications(req.user.userId, clamped.page, clamped.pageSize);
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  readAll(@Request() req) {
    return this.notificationService.markAllRead(req.user.userId);
  }

  @Patch(':notificationId/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  read(@Request() req, @Param('notificationId') notificationId: string) {
    return this.notificationService.markRead(req.user.userId, notificationId);
  }
}
