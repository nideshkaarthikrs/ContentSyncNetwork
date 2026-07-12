import { IsString } from 'class-validator';

export class DrmTokenDto {
  @IsString()
  assetId: string;
}
