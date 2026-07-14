import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateListingDto {
  @IsString()
  assetId: string;

  @IsIn(['TUNE', 'SONG', 'VIDEO'])
  assetType: string;

  @IsIn(['EXCLUSIVE', 'NON_EXCLUSIVE', 'PUBLIC'])
  licenseType: string;

  @IsOptional()
  @IsString()
  territory?: string;

  @IsOptional()
  @IsString()
  term?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price: number;
}
