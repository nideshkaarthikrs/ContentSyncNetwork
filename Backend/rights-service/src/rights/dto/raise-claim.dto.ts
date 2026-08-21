import { IsString, MaxLength } from 'class-validator';

export class RaiseClaimDto {
  @IsString()
  assetId: string;

  @IsString()
  @MaxLength(2000)
  reason: string;
}
