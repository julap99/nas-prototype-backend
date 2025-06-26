import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsEnum(['superadmin', 'ekp', 'pkp', 'eoad', 'asnaf'])
  role?: 'superadmin' | 'ekp' | 'pkp' | 'eoad' | 'asnaf';
} 