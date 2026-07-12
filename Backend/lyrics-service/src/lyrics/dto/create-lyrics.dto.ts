import { IsString } from 'class-validator';

export class CreateLyricsDto {
  @IsString()
  tuneId: string;

  @IsString()
  title: string;

  @IsString()
  language: string;

  @IsString()
  lyrics: string;
}
