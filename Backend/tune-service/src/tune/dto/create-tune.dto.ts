import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTuneDto {
  @IsString()
  title: string;

  @IsString()
  genre: string;

  @IsString()
  language: string;

  @IsString()
  mood: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bpm?: number;

}
