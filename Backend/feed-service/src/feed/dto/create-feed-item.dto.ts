import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
