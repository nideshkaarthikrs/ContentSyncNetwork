import { IsIn, IsString } from 'class-validator';

export class PurchaseRightsDto {
  @IsString()
  assetId: string;

  @IsIn(['EXCLUSIVE', 'NON_EXCLUSIVE', 'PUBLIC'])
  licenseType: string;
}
