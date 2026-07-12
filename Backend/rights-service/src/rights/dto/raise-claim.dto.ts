import { IsString } from 'class-validator';

export class RaiseClaimDto {
  @IsString()
  assetId: string;

  @IsString()
  reason: string;
}
