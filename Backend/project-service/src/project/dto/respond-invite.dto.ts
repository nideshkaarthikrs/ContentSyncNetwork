import { IsIn } from 'class-validator';

export class RespondInviteDto {
  @IsIn(['ACCEPTED', 'DECLINED'])
  status: string;
}
