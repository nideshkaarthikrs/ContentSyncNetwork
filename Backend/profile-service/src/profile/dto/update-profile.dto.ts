import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString()
  primaryRole?: string;

  @IsOptional()
  @IsBoolean()
  publicProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotificationsEnabled?: boolean;
}
