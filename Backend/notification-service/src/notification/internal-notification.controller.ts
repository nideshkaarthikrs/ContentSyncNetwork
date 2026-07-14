import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@Controller('internal/notifications')
export class InternalNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(InternalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  record(@Body() dto: CreateNotificationDto) {
    return this.notificationService.recordNotification(dto.recipientUserId, dto.type, dto.title, dto.sourceId);
  }
}
