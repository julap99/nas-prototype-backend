import {
  IsOptional,
  IsString,
  MaxLength,
  IsNumber,
  IsIn,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProcessDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  kodProses?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  namaProses?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsUrl({ require_protocol: false, require_valid_protocol: false })
  idPage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  kodKategori?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsIn([0, 1])
  status?: number;
}
