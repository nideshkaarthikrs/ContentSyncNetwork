import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export enum FeedItemType {
  TUNE = 'TUNE',
  VIDEO = 'VIDEO',
  PROJECT = 'PROJECT',
}

export class CreateFeedItemDto {
  @IsEnum(FeedItemType)
  type: FeedItemType;

  @IsString()
  sourceId: string;

  @IsString()
  actorUserId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
