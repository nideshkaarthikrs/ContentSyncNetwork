import { NotificationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipientUserId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  sourceId?: string;
}
