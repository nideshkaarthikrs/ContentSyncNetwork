import { IsString } from 'class-validator';

export class CreateVideoProjectDto {
  @IsString()
  songId: string;

  @IsString()
  title: string;
}
