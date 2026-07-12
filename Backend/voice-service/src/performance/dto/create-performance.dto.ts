import { IsString } from 'class-validator';

export class CreatePerformanceDto {
  @IsString()
  tuneId: string;

  @IsString()
  lyricsId: string;
}
