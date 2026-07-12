import { IsString } from 'class-validator';

export class GenerateLyricsDto {
  @IsString()
  tuneId: string;

  @IsString()
  language: string;

  @IsString()
  theme: string;
}
