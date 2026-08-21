import { IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(120)
  projectName: string;
}
