import { IsString, MaxLength } from 'class-validator';

export class CreateLyricsDto {
  @IsString()
  tuneId: string;

  @IsString()
  title: string;

  @IsString()
  language: string;

  @IsString()
  @MaxLength(20000)
  lyrics: string;
}
