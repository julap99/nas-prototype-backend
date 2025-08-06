import { IsNotEmpty, IsString, IsOptional, MaxLength, IsNumber, IsIn, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProcessDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  namaProses: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  @IsUrl({ require_protocol: false, require_valid_protocol: false })
  idPage: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
} 