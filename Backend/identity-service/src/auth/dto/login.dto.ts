import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Accepts either an email or a mobile number; format isn't validated here
  // since a non-matching value simply fails to resolve to a user (401).
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;
}
