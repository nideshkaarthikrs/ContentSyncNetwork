import { IsArray, IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  mobile: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
