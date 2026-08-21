import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'mobile must be a valid phone number' })
  mobile: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
