import { IsOptional, IsString } from 'class-validator';

export class UpdateLyricsDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  lyrics?: string;
}
