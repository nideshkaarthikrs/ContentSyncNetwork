import { IsString } from 'class-validator';

export class GenerateStoryboardDto {
  @IsString()
  songId: string;
}
