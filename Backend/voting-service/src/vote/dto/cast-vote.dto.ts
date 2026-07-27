import { IsIn, IsString } from 'class-validator';

export class CastVoteDto {
  @IsIn(['TUNE', 'SONG', 'LYRICS', 'PERFORMANCE', 'VIDEO'])
  entityType: string;

  @IsString()
  entityId: string;
}
