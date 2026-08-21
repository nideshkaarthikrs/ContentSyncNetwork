import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLyricsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  lyrics?: string;
}
