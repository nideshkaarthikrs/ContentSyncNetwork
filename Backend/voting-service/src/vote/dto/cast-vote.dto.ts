import { IsString } from 'class-validator';

export class CastVoteDto {
  @IsString()
  entityType: string;

  @IsString()
  entityId: string;
}
