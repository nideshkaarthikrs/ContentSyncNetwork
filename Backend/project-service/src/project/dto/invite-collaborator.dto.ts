import { IsString } from 'class-validator';

export class InviteCollaboratorDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;
}
